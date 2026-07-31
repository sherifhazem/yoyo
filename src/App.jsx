import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import GameLayout from './components/layout/GameLayout'
import { DAYS, getDay } from './data/days'
import { StoryProvider } from './story/StoryContext'
import { playTransition } from './utils/sound'

// تسجيل الدخول
import LoginScreen from './components/auth/LoginScreen'

// خريطة الأيام
import DayMap from './components/scenes/DayMap'

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
  const { state, login, logout, startDay, goToMap, nextScene, addScore, awardBadge, completeDay, resetGame } =
    useGameState()

  // ----- بنتأكد الأول لو فيه جلسة دخول محفوظة -----
  if (state.authStatus === 'checking') {
    return (
      <GameLayout environment="map" showProgress={false}>
        <div className="flex flex-1 items-center justify-center text-5xl">🧭</div>
      </GameLayout>
    )
  }

  // ----- شاشة الدخول (اسم + رقم سري) -----
  if (state.authStatus === 'login') {
    return (
      <GameLayout environment="map" showProgress={false}>
        <LoginScreen onLogin={login} />
      </GameLayout>
    )
  }

  // ----- شاشة خريطة الأيام -----
  if (state.view === 'map') {
    return (
      <GameLayout environment="map" showProgress={false}>
        <DayMap
          days={DAYS}
          completedDays={state.completedDays}
          playerName={state.playerName}
          onSelectDay={(id) => {
            playTransition()
            startDay(id)
          }}
          onReset={resetGame}
          onLogout={logout}
        />
      </GameLayout>
    )
  }

  // ----- شاشة اليوم النشط -----
  const day = getDay(state.activeDay)
  const sequence = day.sceneSequence
  const total = sequence.length

  // حماية من تجاوز الحدود لو الحفظ فيه رقم غريب
  const index = Math.min(state.currentScene, total - 1)
  const scene = sequence[index]
  const SceneComponent = SCENE_COMPONENTS[scene.component]

  const handleComplete = () => {
    if (index < total - 1) {
      playTransition()
      nextScene()
    }
  }

  const isFinal = scene.component === 'FinalScene'

  const handleBackToMap = () => {
    playTransition()
    goToMap()
  }

  return (
    <StoryProvider day={day}>
      <GameLayout environment={scene.environment} current={index} total={total} showProgress={!isFinal}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${day.id}-${scene.id}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex flex-1 flex-col"
          >
            <SceneComponent
              onComplete={isFinal ? () => completeDay(day.id) : handleComplete}
              onBackToMap={handleBackToMap}
              addScore={addScore}
              awardBadge={awardBadge}
            />
          </motion.div>
        </AnimatePresence>
      </GameLayout>
    </StoryProvider>
  )
}
