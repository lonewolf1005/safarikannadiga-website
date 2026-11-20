import { redirect } from 'next/navigation';

// Redirect legacy /tours to /upcoming-tours to unify tour discovery
export default function ToursPage() {
    redirect('/upcoming-tours');
}
