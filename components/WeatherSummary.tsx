'use client';

// hooks
import { useEffect, useState } from 'react';
import useSpeechSynthesis from '@/hooks/useSpeechSynthesis.hook';
import useInterval from '@/hooks/useInterval.hook';

// lib
import cleanWeatherData from '@/lib/cleanWeatherData';
import getBasePath from '@/lib/getBasePath';
import { Root } from '@/types/weather';

// components
import CalloutCard from './CalloutCard';

type Props = {
  city: string;
  results: Root;
};

function WeatherSummary({ results, city }: Props) {
  const [GPTdata, setGPTdata] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dots, setDots] = useState('');
  const { isSpeaking, speak, cancelSpeak } = useSpeechSynthesis();

  useEffect(() => {
    const handleFetch = async () => {
      if (!results?.latitude) return;

      const dataToSendGPT = cleanWeatherData(results, city);

      const res = await fetch(`${getBasePath()}/api/getWeatherSummary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weatherData: dataToSendGPT,
        }),
      });

      const GPTdata = await res.json();
      setGPTdata(GPTdata.content);
      setIsLoading(false);
    };

    handleFetch();
  }, [city, results]);

  useInterval(
    () => {
      setDots((dots) => (dots === '...' ? '' : dots + '.'));
    },
    1000,
    !isLoading
  );

  const loadingMsg = `Loading AI Weather Summary${dots}`;

  const Icon = isSpeaking ? SpeakerWaveIcon : SpeakerMutedIcon;

  return (
    <div className="relative">
      <CalloutCard
        className="text-black mt-4 pb-[42px]"
        message={isLoading ? loadingMsg : GPTdata}
      />

      {!isLoading && (
        <Icon
          className="block absolute bottom-[5px] right-[10px] text-black w-[48px] h-[48px] cursor-pointer"
          onClick={() => {
            if (!isSpeaking) {
              speak({ text: GPTdata });
            } else {
              cancelSpeak();
            }
          }}
        />
      )}
    </div>
  );
}

function SpeakerWaveIcon({ onClick, className }: any) {
  return (
    <svg
      onClick={onClick}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
      <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
    </svg>
  );
}

function SpeakerMutedIcon({ onClick, className }: any) {
  return (
    <svg
      onClick={onClick}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
    </svg>
  );
}

export default WeatherSummary;
