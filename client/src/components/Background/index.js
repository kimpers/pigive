import React from "react";
import styled from "styled-components";
import { times, once, all } from "ramda";

import { ReactComponent as FlagSvg } from "./Flag.svg";
import planetPath from "./planet.png";
import { device } from "../../constants";

const Flag = styled(FlagSvg)`
  height: 200px
  width: 200px;
  bottom: 190px
  right: -50px;

  position: fixed;
  transform: rotate(10deg);

  @media ${device.desktop} {
    height: 400px
    width: 400px;
    bottom: 370px;
  }

  @media (min-width: 3000px) {
    display: none;
  }

  @media (max-width: 310px) {
    display: none;
  }
`;

const BackgroundContainer = styled.div`
  max-height: 400px;
  overflow: hidden;
  width: 100%;
  position: absolute;
  bottom: -10px;

  @media ${device.desktop} {
    max-height: 600px;
  }
`;

const Planet = styled.img`
  position: absolute;
  right: 100px;
  top: 10px;
  z-index: 1;

  @media (max-width: 310px) {
    display: none;
  }
`;

const RandomStars = once(() => {
  const prevTop = [];
  const prevLeft = [];

  // Generate random positions for each star but make sure
  // to never put a new star too close to an existing star
  const getUniqueRandom = (prevValues, multiplier, addition = 0) => {
    let tries = 0;
    while (true) {
      const current = Math.floor(Math.random() * multiplier) + addition;

      if (all(v => Math.abs(v - current) >= 5, prevValues) || tries > 10) {
        prevValues.push(current);
        return current;
      } else {
        console.log(
          `current ${current} is duplicated in ${prevValues.join(
            ", "
          )}, tries ${tries}`
        );
      }

      tries++;
    }
  };

  const GenerateStar = () => {
    const top = getUniqueRandom(prevTop, 50, 5);
    const left = getUniqueRandom(prevLeft, 90, 5);
    const size = Math.floor(Math.random() * 10) + 10;
    const opacity = Math.min(Math.random() + 0.2, 1);

    return (
      <div
        style={{
          top: `${top}%`,
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: `${opacity}`,
          background: "#fff",
          borderRadius: "50%",
          position: "absolute"
        }}
      />
    );
  };

  const numStars = window.innerWidth >= 1024 ? 8 : 5;

  return times(GenerateStar, numStars);
});

const Space = styled.div`
  height: 100%;
  background: linear-gradient(#01110a, #01110ab8);
`;

const Background = ({ children }) => (
  <Space>
    <Planet src={planetPath} />
    {children}
    <RandomStars />
    <BackgroundContainer>
      <Moon />
    </BackgroundContainer>
    <Flag />
  </Space>
);

const Moon = () => (
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 -34.706 1920 1534.706"
    enableBackground="new 0 -34.706 1920 1534.706"
    xmlSpace="preserve"
    style={{
      width: "100%"
    }}
  >
    <g id="Layer_2">
      <path
        fill="#FFF8F0"
        d="M1760.02,386.675c0-64.372,52.186-116.554,116.553-116.554c15.352,0,30.006,2.975,43.428,8.367v-5.846
  h0.002v-162.87C1771.174,25.246,1397.48-34.706,960.001-34.706c-437.481,0-811.171,59.95-960,144.477v81.437v81.435v440.543
  c0-56.389,45.711-102.099,102.1-102.099c56.387,0,102.098,45.71,102.098,102.099c0,56.388-45.711,102.101-102.098,102.101
  C45.711,815.286,0,769.573,0,713.186v139.627v661.607h1920V494.858c-13.422,5.393-28.078,8.367-43.428,8.367
  C1812.205,503.226,1760.02,451.042,1760.02,386.675z M204.198,1317.006c-33.354,0-60.393-27.039-60.393-60.392
  c0-33.355,27.039-60.393,60.393-60.393c33.353,0,60.393,27.038,60.393,60.393C264.591,1289.967,237.551,1317.006,204.198,1317.006z
   M322.128,488.578c-71.855,0-130.103-58.248-130.103-130.102s58.248-130.102,130.103-130.102
  c71.853,0,130.102,58.248,130.102,130.102C452.229,430.329,393.981,488.578,322.128,488.578z M838.612,330.514
  c-33.354,0-60.393-27.037-60.393-60.393c0-33.354,27.039-60.393,60.393-60.393c33.353,0,60.393,27.038,60.393,60.393
  C899.005,303.477,871.965,330.514,838.612,330.514z M1368.459,479.259c-33.352,0-60.393-27.037-60.393-60.391
  c0-33.354,27.041-60.393,60.393-60.393c33.355,0,60.393,27.039,60.393,60.393C1428.852,452.221,1401.813,479.259,1368.459,479.259z
   M1648.521,877.604c-90.805,0-164.418-73.611-164.418-164.416c0-90.806,73.613-164.416,164.418-164.416
  c90.803,0,164.416,73.61,164.416,164.416C1812.938,803.99,1739.324,877.604,1648.521,877.604z"
      />
      <circle fill="#C8BBB3" cx="322.128" cy="358.475" r="130.103" />
      <circle fill="#C8BBB3" cx="102.1" cy="713.187" r="102.1" />
      <circle fill="#C8BBB3" cx="838.612" cy="270.121" r="60.393" />
      <circle fill="#C8BBB3" cx="204.198" cy="1256.614" r="60.393" />
      <circle fill="#C8BBB3" cx="1368.459" cy="418.866" r="60.393" />
      <circle fill="#C8BBB3" cx="1648.521" cy="713.186" r="164.415" />
      <path
        fill="#C8BBB3"
        d="M1876.572,270.121c-64.369,0-116.553,52.181-116.553,116.554c0,64.367,52.186,116.551,116.553,116.551
  c15.352,0,30.006-2.974,43.428-8.367V278.489C1906.578,273.096,1891.924,270.121,1876.572,270.121z"
      />
    </g>
  </svg>
);

export default Background;
