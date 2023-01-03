import { PrismicText, PrismicRichText } from '@prismicio/react';
import type { Content } from '@prismicio/client';
import { createClient } from '../prismicio';
import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '../styles/Home.module.css';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ card, day }: { card: Content.CardDocumentData; day: number }) {
  return (
    <>
      <Head>
        <title>Afmælismyndir!</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Til hamingju með afmælið &#128155; <br /> Hér munu birtast handahófskendar myndir
            reglulega þannig þú getir alltaf kíkt (og gleymir mér ekki)
          </p>
          {day > 0 && <p>Dagar þangað til Axel kemur: {day}</p>}
        </div>

        <div className={styles.center}>
          <Image
            style={{ objectFit: 'contain' }}
            fill
            priority
            alt="mynd af Axel"
            src={card.image.url as string}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={inter.className}>{card.title}</h2>
            <p className={inter.className}>{card.details}</p>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  // Client used to fetch CMS content.
  const client = createClient();

  // Page document for our homepage from the CMS.
  const cards = await client.getAllByType('card');
  const day = await (await client.getSingle('days')).data;

  const card = cards[0].data;

  // Pass the homepage as prop to our page.
  return {
    props: { card, day: day.days ?? 0 },
  };
}
