import IngestHero from "../features/home/IngestHero";
import HowItWorks from "../features/home/HowItWorks";
import RecentLectures from "../features/home/RecentLectures";
import CtaBanner from "../features/home/CtaBanner";

export function HomePage() {
  return (
    <>
      <IngestHero />
      <HowItWorks />
      <RecentLectures />
      <CtaBanner />
    </>
  );
}

export default HomePage;
