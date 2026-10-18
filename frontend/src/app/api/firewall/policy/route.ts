import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface FirewallPolicy {
  professionalName: string;
  professionalRole: string;
  firewallActive: boolean;
  threshold: number;
  minCommits: number;
  mandatorySkills: string[];
  updatedAt: string;
}

const POLICY_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_firewall_policies.json');

function readPolicies(): Record<string, FirewallPolicy> {
  try {
    if (!fs.existsSync(POLICY_FILE_PATH)) {
      const initial: Record<string, FirewallPolicy> = {
        default: {
          professionalName: 'Verified Alumni Leader',
          professionalRole: 'Senior Engineering Architect',
          firewallActive: true,
          threshold: 75,
          minCommits: 15,
          mandatorySkills: ['React', 'Docker', 'PostgreSQL'],
          updatedAt: new Date().toISOString(),
        },
      };
      fs.writeFileSync(POLICY_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(POLICY_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Firewall Policy Read Error]:', err);
    return {};
  }
}

function writePolicies(policies: Record<string, FirewallPolicy>) {
  try {
    const dir = path.dirname(POLICY_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POLICY_FILE_PATH, JSON.stringify(policies, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Firewall Policy Write Error]:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const professionalName = searchParams.get('professionalName') || 'default';
    const policies = readPolicies();

    let policy = policies[professionalName];
    if (!policy) {
      const defaultPol = policies['default'] || {
        professionalName: 'Verified Alumni Leader',
        professionalRole: 'Senior Engineering Architect',
        firewallActive: true,
        threshold: 75,
        minCommits: 15,
        mandatorySkills: ['React', 'Docker', 'PostgreSQL'],
        updatedAt: new Date().toISOString(),
      };

      if (professionalName === 'default') {
        policy = defaultPol;
      } else {
        policy = {
          professionalName,
          professionalRole: 'Verified Alumni & Senior Architect',
          firewallActive: defaultPol.firewallActive !== undefined ? defaultPol.firewallActive : true,
          threshold: defaultPol.threshold || 75,
          minCommits: defaultPol.minCommits || 15,
          mandatorySkills: defaultPol.mandatorySkills || ['React', 'Docker', 'PostgreSQL'],
          updatedAt: new Date().toISOString(),
        };
      }
    }

    return NextResponse.json({
      success: true,
      policy,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      professionalName = 'default',
      professionalRole = 'Senior Engineering Architect',
      firewallActive = true,
      threshold = 75,
      minCommits = 15,
      mandatorySkills = ['React', 'Docker', 'PostgreSQL'],
    } = body;

    const policies = readPolicies();

    const updatedPolicy: FirewallPolicy = {
      professionalName,
      professionalRole,
      firewallActive: Boolean(firewallActive),
      threshold: Number(threshold) || 75,
      minCommits: Number(minCommits) || 15,
      mandatorySkills: Array.isArray(mandatorySkills) ? mandatorySkills : ['React', 'Docker'],
      updatedAt: new Date().toISOString(),
    };

    policies[professionalName] = updatedPolicy;
    // Also update default if this is the active professional configuring it
    policies['default'] = updatedPolicy;

    writePolicies(policies);

    return NextResponse.json({
      success: true,
      message: 'Firewall policy successfully saved and deployed to live gateway!',
      policy: updatedPolicy,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save policy' },
      { status: 500 }
    );
  }
}
