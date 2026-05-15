import { redirect } from 'next/navigation';

// /outreach root has no UI of its own — bounce to the rolling
// territory dashboard.
export default function OutreachIndex() {
  redirect('/outreach/dashboard');
}
