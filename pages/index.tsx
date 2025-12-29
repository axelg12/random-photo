import { useState, useEffect } from 'react';
import type { Content } from '@prismicio/client';
import { createClient } from '../prismicio';
import Head from 'next/head';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo, faHeart } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Home.module.css';

export default function Home({ cards, day }: { cards: Content.CardDocumentData[]; day: number }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);

  const newPhoto = () => {
    setIsChanging(true);
    setTimeout(() => {
      if (photoIndex == 2) {
        setPhotoIndex(0);
      } else {
        setPhotoIndex(photoIndex + 1);
      }
      setIsChanging(false);
    }, 150);
  };

  // Create sparkle effects
  useEffect(() => {
    const createSparkle = () => {
      const colors = ['#ff69b4', '#da70d6', '#87ceeb', '#ffd700', '#98fb98'];
      const newSparkle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setSparkles((prev) => [...prev.slice(-20), newSparkle]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, 2000);
    };

    const interval = setInterval(createSparkle, 300);
    return () => clearInterval(interval);
  }, []);

  const decorativeEmojis = ['✨', '💖', '⭐', '🌟', '💫', '🎀', '💕', '🌸', '🦄', '💝'];

  return (
    <>
      <Head>
        <title>Afmælismyndir! 💕</title>
        <meta name="description" content="A special gift for Margrét" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Glitter overlay */}
      <div className={styles.glitterOverlay}>
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className={styles.sparkle}
            style={
              {
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                '--glitter-color': sparkle.color,
                '--tx': `${(Math.random() - 0.5) * 200}px`,
                '--ty': `${(Math.random() - 0.5) * 200}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Tiny decorative graphics floating around */}
      {decorativeEmojis.slice(0, 6).map((emoji, index) => (
        <div
          key={index}
          className={styles.decorative}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          {emoji}
        </div>
      ))}

      <main className={styles.main}>
        <div className={styles.description}>
          <div>
            <div>Elsku Margrét,</div>
            <div>
              <br />
              Til hamingju með afmælið 💕 Ég vildi óska þess ég væri hjá þér í dag sem og aðra daga.
              Nú styttist í að ég komi en þú getur alltaf kíkt hingað inn til að sjá hvað það er
              langt þangað til (og núna þarftu ekki countdown app)
            </div>
            <div>
              <br />
              Hér munu birtast mismunandi handahófskendar myndir daglega þannig þú getir alltaf kíkt
              (og gleymir mér ekki þangað til ég kem)
            </div>
          </div>
          <div className={styles.countdown}>
            <span>
              <FontAwesomeIcon icon={faHeart} style={{ marginRight: '0.5rem', fontSize: '10px' }} />
              Dagar til jóla: <strong>{day}</strong>
            </span>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.photoFrame}>
            <div className={`${styles.photoInner} ${isChanging ? styles.fadeOut : styles.fadeIn}`}>
              <Image
                key={photoIndex}
                style={{ objectFit: 'cover' }}
                fill
                priority
                alt="mynd af Axel"
                src={cards[photoIndex].image.url as string}
              />
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>
              {cards[photoIndex].title}
              <button onClick={newPhoto} className={styles.button} aria-label="Ný mynd">
                <FontAwesomeIcon icon={faRedo} />
              </button>
            </h2>
            <p>{cards[photoIndex].details}</p>
          </div>
        </div>

        <div className={styles.audioContainer}>
          <audio controls autoPlay loop>
            <source src="/selfcontrol.mp3" type="audio/mpeg" />
          </audio>
        </div>
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
    if (useSinglePhoto) {
      cards.sort((a, b) => {
        if (a.id == 'Y81UGREAACMArNUg') {
          return 1;
        }
        return 0;
      });
      return [cards[0].data, cards[1].data, cards[2].data];
    }
    if (randomNum >= cards.length - 2) {
      return [cards[randomNum].data, cards[0].data, cards[1].data];
    } else {
      return [cards[randomNum].data, cards[randomNum + 1].data, cards[randomNum + 2].data];
    }
  };

  const randomNum = randomPhotoPerDay();
  let pickedCards = getRandomCards(randomNum);

  const dateDiff = new Date(day ?? '').getTime() - now.getTime();
  const dateDiffDays = Math.round(dateDiff / (1000 * 3600 * 24));

  // Pass the homepage as prop to our page.
  return {
    props: { cards: pickedCards, day: dateDiffDays },
  };
}
