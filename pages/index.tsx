import { useState } from 'react';
import type { Content } from '@prismicio/client';
import { createClient } from '../prismicio';
import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Home.module.css';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ cards, day }: { cards: Content.CardDocumentData[]; day: number }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const newPhoto = () => {
    if (photoIndex == 2) {
      setPhotoIndex(0);
    } else {
      setPhotoIndex(photoIndex + 1);
    }
  };

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
          <div>
            <div>Elsku Margrét,</div>
            <div>
              <br />
              Til hamingju með afmælið &#128155; Ég vildi óska þess ég væri hjá þér í dag sem og
              aðra daga. Nú styttist í að ég komi en þú getur alltaf kíkt hingað inn til að sjá hvað
              það er langt þangað til (og núna þarftu ekki countdown app)
            </div>
            <div>
              <br />
              Hér munu birtast mismunandi handahófskendar myndir daglega þannig þú getir alltaf kíkt
              (og gleymir mér ekki þangað til ég kem)
            </div>
          </div>
          {<p>Dagar þangað til Axel kemur: {day}</p>}
        </div>

        <div className={styles.center}>
          <Image
            style={{ objectFit: 'contain' }}
            fill
            priority
            alt="mynd af Axel"
            src={cards[photoIndex].image.url as string}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={inter.className}>
              {cards[photoIndex].title}
              <button onClick={newPhoto} className={styles.button}>
                <FontAwesomeIcon icon={faRedo} style={{ fontSize: 20 }} />
              </button>
            </h2>
            <p className={inter.className}>{cards[photoIndex].details}</p>
          </div>
        </div>
        <audio controls autoPlay>
          <source src="/selfcontrol.mp3" type="audio/mpeg" />
        </audio>
      </main>
    </>
  );
}

const isBirthday = (someDate: Date) => {
  const bday = new Date('2023-02-10');
  return someDate.getDate() == bday.getDate() && someDate.getMonth() == bday.getMonth();
};

export async function getServerSideProps() {
  // Client used to fetch CMS content.
  const client = createClient();
  const now = new Date();

  const useSinglePhoto = isBirthday(now);

  console.log('use', useSinglePhoto, now);

  let cards: Content.CardDocument<string>[] = [];
  if (useSinglePhoto) {
    // display specific photo on birthday
    cards = await client.getAllByTag('birthday');
  } else {
    // fetch all the photos
    cards = await client.getAllByType('card');
  }
  // fetch the countdown date
  const day = await (await client.getSingle('days')).data.days;

  const randomPhotoPerDay = () => {
    return (now.getFullYear() * now.getDate() * (now.getMonth() + 1)) % cards.length;
  };

  const getRandomCards = (randomNum: number) => {
    if (randomNum >= cards.length - 2) {
      return [cards[randomNum].data, cards[0].data, cards[1].data];
    } else {
      return [cards[randomNum].data, cards[randomNum + 1].data, cards[randomNum + 2].data];
    }
  };

  const randomNum = randomPhotoPerDay();
  const pickedCards = getRandomCards(randomNum);

  const dateDiff = new Date(day ?? '').getTime() - now.getTime();
  const dateDiffDays = Math.round(dateDiff / (1000 * 3600 * 24));

  // Pass the homepage as prop to our page.
  return {
    props: { cards: pickedCards, day: dateDiffDays },
  };
}
