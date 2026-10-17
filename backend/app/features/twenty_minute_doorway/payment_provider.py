import hmac
import hashlib
import json
import secrets
import time
from typing import Protocol, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PaymentIntentResult:
    provider_name: str
    provider_order_id: str
    amount_minor: int
    currency: str
    client_secret: str
    status: str
    idempotency_key: str


@dataclass
class PaymentVerificationResult:
    success: bool
    provider_order_id: str
    provider_payment_id: Optional[str]
    amount_minor: int
    currency: str
    status: str
    error_message: Optional[str] = None


@dataclass
class RefundResult:
    success: bool
    provider_refund_id: Optional[str]
    amount_minor: int
    currency: str
    status: str
    error_message: Optional[str] = None


@dataclass
class PayoutResult:
    success: bool
    provider_transfer_id: Optional[str]
    amount_minor: int
    currency: str
    status: str
    error_message: Optional[str] = None


class PaymentProviderInterface(Protocol):
    """
    Protocol defining the payment gateway provider contract.
    Ensures safe abstraction over actual payment processors.
    """

    def create_order(
        self,
        amount_minor: int,
        currency: str,
        idempotency_key: str,
        metadata: Dict[str, Any]
    ) -> PaymentIntentResult:
        ...

    def verify_payment(
        self,
        provider_order_id: str,
        provider_payment_id: str,
        client_signature: Optional[str] = None
    ) -> PaymentVerificationResult:
        ...

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        secret: str
    ) -> bool:
        ...

    def process_refund(
        self,
        provider_payment_id: str,
        amount_minor: int,
        currency: str,
        reason: str
    ) -> RefundResult:
        ...

    def disburse_payout(
        self,
        expert_user_id: int,
        amount_minor: int,
        currency: str,
        destination_account_mask: str,
        idempotency_key: str
    ) -> PayoutResult:
        ...


class MockPaymentGatewayProvider:
    """
    Production-grade mock payment gateway provider.
    Implements standard HMAC-SHA256 signature verification, idempotent order creation,
    capture simulation, refund processing, and automated transfer simulation.
    """

    DEFAULT_WEBHOOK_SECRET = "kin_doorway_webhook_secret_dev_32b_hex"

    def __init__(self, webhook_secret: Optional[str] = None):
        self.webhook_secret = webhook_secret or self.DEFAULT_WEBHOOK_SECRET
        self._orders: Dict[str, Dict[str, Any]] = {}
        self._payments: Dict[str, Dict[str, Any]] = {}
        self._transfers: Dict[str, Dict[str, Any]] = {}
        self._should_fail_payout: bool = False
        self._should_fail_verification: bool = False

    def set_payout_failure_simulation(self, should_fail: bool) -> None:
        """Testing hook to simulate temporary payout gateway failures."""
        self._should_fail_payout = should_fail

    def set_verification_failure_simulation(self, should_fail: bool) -> None:
        """Testing hook to simulate payment verification failures."""
        self._should_fail_verification = should_fail

    def create_order(
        self,
        amount_minor: int,
        currency: str,
        idempotency_key: str,
        metadata: Dict[str, Any]
    ) -> PaymentIntentResult:
        # Check for idempotent repeat
        for order_id, order_data in self._orders.items():
            if order_data.get("idempotency_key") == idempotency_key:
                return PaymentIntentResult(
                    provider_name="mock_gateway",
                    provider_order_id=order_id,
                    amount_minor=order_data["amount_minor"],
                    currency=order_data["currency"],
                    client_secret=order_data["client_secret"],
                    status=order_data["status"],
                    idempotency_key=idempotency_key
                )

        provider_order_id = f"ord_kin_{secrets.token_hex(12)}"
        client_secret = f"kin_sec_{secrets.token_hex(24)}"
        order_entry = {
            "order_id": provider_order_id,
            "amount_minor": amount_minor,
            "currency": currency,
            "client_secret": client_secret,
            "status": "created",
            "idempotency_key": idempotency_key,
            "metadata": metadata,
            "created_at": time.time(),
        }
        self._orders[provider_order_id] = order_entry

        return PaymentIntentResult(
            provider_name="mock_gateway",
            provider_order_id=provider_order_id,
            amount_minor=amount_minor,
            currency=currency,
            client_secret=client_secret,
            status="pending",
            idempotency_key=idempotency_key
        )

    def verify_payment(
        self,
        provider_order_id: str,
        provider_payment_id: str,
        client_signature: Optional[str] = None
    ) -> PaymentVerificationResult:
        if self._should_fail_verification:
            return PaymentVerificationResult(
                success=False,
                provider_order_id=provider_order_id,
                provider_payment_id=provider_payment_id,
                amount_minor=0,
                currency="INR",
                status="failed",
                error_message="Gateway declined payment or transaction not found"
            )

        order_data = self._orders.get(provider_order_id)
        amount_minor = order_data["amount_minor"] if order_data else 5000
        currency = order_data["currency"] if order_data else "INR"

        if client_signature:
            # Verify signature if provided: hmac(order_id|payment_id, secret)
            expected_sig = self.compute_signature(f"{provider_order_id}|{provider_payment_id}", self.webhook_secret)
            if not hmac.compare_digest(expected_sig, client_signature):
                return PaymentVerificationResult(
                    success=False,
                    provider_order_id=provider_order_id,
                    provider_payment_id=provider_payment_id,
                    amount_minor=amount_minor,
                    currency=currency,
                    status="failed",
                    error_message="Invalid payment signature"
                )

        # Mark paid
        if order_data:
            order_data["status"] = "paid"
            order_data["payment_id"] = provider_payment_id

        self._payments[provider_payment_id] = {
            "order_id": provider_order_id,
            "payment_id": provider_payment_id,
            "amount_minor": amount_minor,
            "currency": currency,
            "status": "succeeded",
        }

        return PaymentVerificationResult(
            success=True,
            provider_order_id=provider_order_id,
            provider_payment_id=provider_payment_id,
            amount_minor=amount_minor,
            currency=currency,
            status="succeeded"
        )

    def compute_signature(self, message: str, secret: str) -> str:
        """Generates standard HMAC-SHA256 signature."""
        return hmac.new(secret.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        secret: Optional[str] = None
    ) -> bool:
        """Verifies webhook payload with HMAC-SHA256."""
        if not signature_header:
            return False
        sec = secret or self.webhook_secret
        expected = hmac.new(sec.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature_header.strip())

    def process_refund(
        self,
        provider_payment_id: str,
        amount_minor: int,
        currency: str,
        reason: str
    ) -> RefundResult:
        refund_id = f"rfnd_{secrets.token_hex(10)}"
        return RefundResult(
            success=True,
            provider_refund_id=refund_id,
            amount_minor=amount_minor,
            currency=currency,
            status="processed"
        )

    def disburse_payout(
        self,
        expert_user_id: int,
        amount_minor: int,
        currency: str,
        destination_account_mask: str,
        idempotency_key: str
    ) -> PayoutResult:
        if self._should_fail_payout:
            return PayoutResult(
                success=False,
                provider_transfer_id=None,
                amount_minor=amount_minor,
                currency=currency,
                status="failed",
                error_message="Automated payout gateway temporary service disruption"
            )

        # Idempotency check for transfers
        for xfer_id, xfer_data in self._transfers.items():
            if xfer_data.get("idempotency_key") == idempotency_key:
                return PayoutResult(
                    success=True,
                    provider_transfer_id=xfer_id,
                    amount_minor=xfer_data["amount_minor"],
                    currency=xfer_data["currency"],
                    status="succeeded"
                )

        transfer_id = f"tr_{secrets.token_hex(12)}"
        self._transfers[transfer_id] = {
            "transfer_id": transfer_id,
            "expert_user_id": expert_user_id,
            "amount_minor": amount_minor,
            "currency": currency,
            "destination": destination_account_mask,
            "idempotency_key": idempotency_key,
            "timestamp": time.time(),
        }

        return PayoutResult(
            success=True,
            provider_transfer_id=transfer_id,
            amount_minor=amount_minor,
            currency=currency,
            status="succeeded"
        )


# Global provider singleton instance for injection
default_payment_provider = MockPaymentGatewayProvider()
