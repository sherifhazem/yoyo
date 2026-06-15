import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import GameLayout from './components/layout/GameLayout'
import { SCENE_SEQUENCE, TOTAL_SCENES } from './data/day1Story'
import { playTransition } from './utils/sound'

// المشاهد
import WakeUpScene from './components/scenes/WakeUpScene'
import AnimalSortScene from './components/scenes/AnimalSortScene'
import BreakfastScene from './components/scenes/BreakfastScene'
import GardenScienceScene from './components/scenes/GardenScienceScene'
import GardenEnglishScene from './components/scenes/GardenEnglishScene'
import GardenEvidenceScene from './components/scenes/GardenEvidenceScene'
import FinalScene from './components/scenes/FinalScene'

const SCENE_COMPONENTS = {
  WakeUpScene,
  AnimalSortScene,
  BreakfastScene,
  GardenScienceScene,
  GardenEnglishScene,
  GardenEvidenceScene,
  FinalScene,
}

export default function App() {
  const { state, nextScene, addScore, awardBadge, completeDay, resetGame } = useGameState()

  // حماية من تجاوز الحدود لو الحفظ فيه رقم غريب
  const index = Math.min(state.currentScene, TOTAL_SCENES - 1)
  const scene = SCENE_SEQUENCE[index]
  const SceneComponent = SCENE_COMPONENTS[scene.component]

  const handleComplete = () => {
    if (index < TOTAL_SCENES - 1) {
      playTransition()
      nextScene()
    }
  }

  const isFinal = scene.component === 'FinalScene'

  return (
    <GameLayout environment={scene.environment} current={index} total={TOTAL_SCENES} showProgress={!isFinal}>
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex flex-1 flex-col"
        >
          <SceneComponent
            onComplete={isFinal ? () => completeDay(state.currentDay) : handleComplete}
            onRestart={resetGame}
            addScore={addScore}
            awardBadge={awardBadge}
          />
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  )
}
