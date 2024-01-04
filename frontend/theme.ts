import { Journey, Theme } from './protos/level_pb.js';

export function setTheme(journey: Journey) {
  switch (journey.theme) {
    case Theme.UNSPECIFIED:
      console.log("Unknown theme " + journey.theme);
      break;
      case Theme.BEACH:
        setBeachTheme()
        break;
      case Theme.MOUNTAIN:
        setMountainTheme()
        break;
      case Theme.SPACE:
        setSpaceTheme();
        break;
      default:
        throw Error('Unknown Theme: ' + journey.theme);
  }
}

function setBeachTheme() {
  document.documentElement.style.setProperty(
    '--body-background',
    '#4B9ADC');
  document.documentElement.style.setProperty(
    '--app-background', '#DCC199');
  document.documentElement.style.setProperty(
    '--primary-color', '#4B9ADC');
  document.documentElement.style.setProperty(
    '--secondary-color', '#F0DBB1');
  document.documentElement.style.setProperty(
    '--tertiary-color', '#54BBE6');
}

function setMountainTheme() {
  document.documentElement.style.setProperty(
    '--body-background',
    '#F8E9D5');
  document.documentElement.style.setProperty(
    '--app-background', '#057399');
  document.documentElement.style.setProperty(
    '--primary-color', '#031C34');
  document.documentElement.style.setProperty(
    '--secondary-color', '#83A8C3');
  document.documentElement.style.setProperty(
    '--tertiary-color', '#0C2744');
}

function setSpaceTheme() {
  document.documentElement.style.setProperty(
    '--body-background',
    '#13576E');
  document.documentElement.style.setProperty(
    '--app-background', '#000F2B');
  document.documentElement.style.setProperty(
    '--primary-color', '#263B61');
  document.documentElement.style.setProperty(
    '--secondary-color', '#1B264D');
  document.documentElement.style.setProperty(
    '--tertiary-color', '#232323');
}


