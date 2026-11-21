import Header from '../components/landing/Header';
import HeroInspeksi from '../components/landing/HeroInspeksi';
import BandOEE from '../components/landing/BandOEE';
import CuplikanDashboard from '../components/landing/CuplikanDashboard';
import UntukSiapa from '../components/landing/UntukSiapa';
import KondisiLini from '../components/landing/KondisiLini';
import CatatDowntime from '../components/landing/CatatDowntime';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-svh overflow-x-clip bg-putih text-tinta">
      <Header />
      <main>
        <HeroInspeksi />
        <BandOEE />
        <CuplikanDashboard />
        <UntukSiapa />
        <KondisiLini />
        <CatatDowntime />
      </main>
      <Footer />
    </div>
  );
}
