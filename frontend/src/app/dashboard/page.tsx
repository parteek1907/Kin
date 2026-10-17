import type { Metadata } from 'next';
import KinGlassDashboard from '@/components/KinGlassDashboard';

export const metadata: Metadata = {
  title: 'KIN Dashboard — Campus Intelligence & Career Engine',
  description: 'Glassmorphic talent & skill verification dashboard for KIN: Career Time Machine, Skill Bounty Network, Qualification-Based Auto Connection, Unclaimed Talent Radar, and Community.',
};

export default function DashboardPage() {
  return <KinGlassDashboard />;
}
