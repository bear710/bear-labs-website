import styles from './page.module.css';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import StoreLocator from '../components/StoreLocator';
import About from '../components/About';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
      <ProductGrid />
      <StoreLocator />
      <About />
      <Footer />
    </main>
  );
}
