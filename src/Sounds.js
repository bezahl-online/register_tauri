import { useSound } from '@vueuse/sound'
import plop from './assets/plop.mp3'
import woosh from './assets/woosh.mp3'
import sniff from './assets/Sniff.mp3'
import error from './assets/error.mp3'
import success from './assets/success.mp3'
import thrown from './assets/ThrownAway.mp3'
import loose from './assets/Looser.mp3'
import keypress from './assets/keypress.mp3'

export default class SoundEffect {
  constructor () {
    this.Sniff = useSound(sniff)
    this.Woosh = useSound(woosh)
    this.Plop = useSound(plop)
    this.Error = useSound(error)
    this.Success = useSound(success)
    this.Throw = useSound(thrown)
    this.Loose = useSound(loose)
    this.KeyPress = useSound(keypress)
    this.KeyPressDownUp = useSound(keypress, {
      sprite: {
        down: [0, 70],
        up: [100,60]
      }
    })
  }
}
