import styles from './page.module.css';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductShowcase from '../components/ProductShowcase';
import StoreLocator from '../components/StoreLocator';
import Merch from '../components/Merch';
import About from '../components/About';
import CollabPartners from '../components/CollabPartners';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
      <ProductShowcase />
      <StoreLocator />
      <Merch />
      <About />
      <CollabPartners />
      <Footer />
    </main>
  );
}
