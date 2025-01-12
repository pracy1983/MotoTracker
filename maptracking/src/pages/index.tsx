import LeafletMap from '../pages/LeafletMap';
import dotenv from 'dotenv';

dotenv.config();

export default function Page() {
  return (
    <div>
      <LeafletMap />
    </div>
  );
}

