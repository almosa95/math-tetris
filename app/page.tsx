"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const BOARD_WIDTH = 6
const BOARD_HEIGHT = 6

const DIFFICULTY_SPEEDS = {
  easy: 1300,
  medium: 1000,
  hard: 700,
  expert: 500,
  nightmare: 300,
  "nightmare+": 250,
  "nightmare++": 225,
}

type Difficulty = "easy" | "medium" | "hard" | "expert" | "nightmare" | "nightmare+" | "nightmare++"
type GameMode = "fixed" | "changing"

interface GameState {
  board: (number | null)[][]
  currentNumber: number
  currentPosition: { x: number; y: number }
  nextNumber: number
  targetSum: number
  score: number
  points: number
  gameOver: boolean
  isPaused: boolean
  difficulty: Difficulty
  gameMode: GameMode
  initialTargetSum: number
  showTargetChange: boolean
  matchAnimation: boolean
  matchingPositions: { x: number; y: number }[]
  finalPiecePosition?: { x: number; y: number }
}

interface UserProfile {
  maxPointsByDifficulty: {
    easy: number
    medium: number
    hard: number
    expert: number
    nightmare: number
    "nightmare+": number
    "nightmare++": number
  }
  achievements: {
    [key: string]: boolean
  }
}

interface SavedGame {
  gameState: GameState
  timestamp: number
}

const getRandomNumber = () => Math.floor(Math.random() * 9) + 1
const getRandomTarget = () => Math.floor(Math.random() * 10) + 10

interface Achievement {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  targetPoints: number
}

const ACHIEVEMENTS: Achievement[] = [
  // Fácil
  {
    id: "easy_500",
    title: "Primer Paso",
    description: "Consigue 500 puntos en Fácil",
    difficulty: "easy",
    targetPoints: 500
  },
  {
    id: "easy_1000",
    title: "Aprendiz",
    description: "Consigue 1000 puntos en Fácil",
    difficulty: "easy",
    targetPoints: 1000
  },
  {
    id: "easy_2000",
    title: "Estudiante",
    description: "Consigue 2000 puntos en Fácil",
    difficulty: "easy",
    targetPoints: 2000
  },
  {
    id: "easy_3000",
    title: "Graduado",
    description: "Consigue 3000 puntos en Fácil",
    difficulty: "easy",
    targetPoints: 3000
  },
  {
    id: "easy_5000",
    title: "Maestro Fácil",
    description: "Consigue 5000 puntos en Fácil",
    difficulty: "easy",
    targetPoints: 5000
  },

  // Medio
  {
    id: "medium_500",
    title: "Equilibrio",
    description: "Consigue 500 puntos en Medio",
    difficulty: "medium",
    targetPoints: 500
  },
  {
    id: "medium_1000",
    title: "Calculador",
    description: "Consigue 1000 puntos en Medio",
    difficulty: "medium",
    targetPoints: 1000
  },
  {
    id: "medium_2000",
    title: "Estratega",
    description: "Consigue 2000 puntos en Medio",
    difficulty: "medium",
    targetPoints: 2000
  },
  {
    id: "medium_3000",
    title: "Táctico",
    description: "Consigue 3000 puntos en Medio",
    difficulty: "medium",
    targetPoints: 3000
  },
  {
    id: "medium_5000",
    title: "Maestro Medio",
    description: "Consigue 5000 puntos en Medio",
    difficulty: "medium",
    targetPoints: 5000
  },

  // Difícil
  {
    id: "hard_500",
    title: "Desafiante",
    description: "Consigue 500 puntos en Difícil",
    difficulty: "hard",
    targetPoints: 500
  },
  {
    id: "hard_1000",
    title: "Valiente",
    description: "Consigue 1000 puntos en Difícil",
    difficulty: "hard",
    targetPoints: 1000
  },
  {
    id: "hard_2000",
    title: "Guerrero",
    description: "Consigue 2000 puntos en Difícil",
    difficulty: "hard",
    targetPoints: 2000
  },
  {
    id: "hard_3000",
    title: "Campeón",
    description: "Consigue 3000 puntos en Difícil",
    difficulty: "hard",
    targetPoints: 3000
  },
  {
    id: "hard_5000",
    title: "Maestro Difícil",
    description: "Consigue 5000 puntos en Difícil",
    difficulty: "hard",
    targetPoints: 5000
  },

  // Experto
  {
    id: "expert_500",
    title: "Especialista",
    description: "Consigue 500 puntos en Experto",
    difficulty: "expert",
    targetPoints: 500
  },
  {
    id: "expert_1000",
    title: "Profesional",
    description: "Consigue 1000 puntos en Experto",
    difficulty: "expert",
    targetPoints: 1000
  },
  {
    id: "expert_2000",
    title: "Virtuoso",
    description: "Consigue 2000 puntos en Experto",
    difficulty: "expert",
    targetPoints: 2000
  },
  {
    id: "expert_3000",
    title: "Genio",
    description: "Consigue 3000 puntos en Experto",
    difficulty: "expert",
    targetPoints: 3000
  },
  {
    id: "expert_5000",
    title: "Maestro Experto",
    description: "Consigue 5000 puntos en Experto",
    difficulty: "expert",
    targetPoints: 5000
  },

  // Pesadilla
  {
    id: "nightmare_500",
    title: "Superviviente",
    description: "Consigue 500 puntos en Pesadilla",
    difficulty: "nightmare",
    targetPoints: 500
  },
  {
    id: "nightmare_1000",
    title: "Imparable",
    description: "Consigue 1000 puntos en Pesadilla",
    difficulty: "nightmare",
    targetPoints: 1000
  },
  {
    id: "nightmare_2000",
    title: "Leyenda",
    description: "Consigue 2000 puntos en Pesadilla",
    difficulty: "nightmare",
    targetPoints: 2000
  },
  {
    id: "nightmare_3000",
    title: "Mítico",
    description: "Consigue 3000 puntos en Pesadilla",
    difficulty: "nightmare",
    targetPoints: 3000
  },
  {
    id: "nightmare_5000",
    title: "Maestro Pesadilla",
    description: "Consigue 5000 puntos en Pesadilla",
    difficulty: "nightmare",
    targetPoints: 5000
  },

  // Pesadilla+
  {
    id: "nightmare+_500",
    title: "Ciego Valiente",
    description: "Consigue 500 puntos en Pesadilla+",
    difficulty: "nightmare+",
    targetPoints: 500
  },
  {
    id: "nightmare+_1000",
    title: "Intuición Pura",
    description: "Consigue 1000 puntos en Pesadilla+",
    difficulty: "nightmare+",
    targetPoints: 1000
  },
  {
    id: "nightmare+_2000",
    title: "Sexto Sentido",
    description: "Consigue 2000 puntos en Pesadilla+",
    difficulty: "nightmare+",
    targetPoints: 2000
  },
  {
    id: "nightmare+_3000",
    title: "Vidente",
    description: "Consigue 3000 puntos en Pesadilla+",
    difficulty: "nightmare+",
    targetPoints: 3000
  },
  {
    id: "nightmare+_5000",
    title: "Maestro Ciego",
    description: "Consigue 5000 puntos en Pesadilla+",
    difficulty: "nightmare+",
    targetPoints: 5000
  },

  // Pesadilla++
  {
    id: "nightmare++_500",
    title: "Locura Controlada",
    description: "Consigue 500 puntos en Pesadilla++",
    difficulty: "nightmare++",
    targetPoints: 500
  },
  {
    id: "nightmare++_1000",
    title: "Caos Maestro",
    description: "Consigue 1000 puntos en Pesadilla++",
    difficulty: "nightmare++",
    targetPoints: 1000
  },
  {
    id: "nightmare++_2000",
    title: "Dios del Caos",
    description: "Consigue 2000 puntos en Pesadilla++",
    difficulty: "nightmare++",
    targetPoints: 2000
  },
  {
    id: "nightmare++_3000",
    title: "Emperador Ciego",
    description: "Consigue 3000 puntos en Pesadilla++",
    difficulty: "nightmare++",
    targetPoints: 3000
  },
  {
    id: "nightmare++_5000",
    title: "Maestro Supremo",
    description: "Consigue 5000 puntos en Pesadilla++",
    difficulty: "nightmare++",
    targetPoints: 5000
  },
]

export default function MathTetris() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null)),
    currentNumber: getRandomNumber(),
    currentPosition: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
    nextNumber: getRandomNumber(),
    targetSum: getRandomTarget(),
    score: 0,
    points: 0,
    gameOver: false,
    isPaused: false,
    difficulty: "medium",
    gameMode: "fixed",
    initialTargetSum: 15,
    showTargetChange: false,
    matchAnimation: false,
    matchingPositions: [],
    finalPiecePosition: undefined,
  })

  const [gameStarted, setGameStarted] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("medium")
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("fixed")

  const [showProfile, setShowProfile] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  const [userProfile, setUserProfile] = useState<UserProfile>({
    maxPointsByDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
      nightmare: 0,
      "nightmare+": 0,
      "nightmare++": 0,
    },
    achievements: {},
  })

  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  const loadProfile = useCallback(() => {
    try {
      const saved = localStorage.getItem("mathTetrisProfile")
      if (saved) {
        const profile = JSON.parse(saved)
        setUserProfile({
          maxPointsByDifficulty: {
            easy: profile.maxPointsByDifficulty?.easy || 0,
            medium: profile.maxPointsByDifficulty?.medium || 0,
            hard: profile.maxPointsByDifficulty?.hard || 0,
            expert: profile.maxPointsByDifficulty?.expert || 0,
            nightmare: profile.maxPointsByDifficulty?.nightmare || 0,
            "nightmare+": profile.maxPointsByDifficulty?.["nightmare+"] || 0,
            "nightmare++": profile.maxPointsByDifficulty?.["nightmare++"] || 0,
          },
          achievements: profile.achievements || {},
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setUserProfile({
        maxPointsByDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
          expert: 0,
          nightmare: 0,
          "nightmare+": 0,
          "nightmare++": 0,
        },
        achievements: {},
      })
    }
  }, [])

  const saveProfile = useCallback((profile: UserProfile) => {
    try {
      localStorage.setItem("mathTetrisProfile", JSON.stringify(profile))
      setUserProfile(profile)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }, [])

  const checkSavedGame = useCallback(() => {
    const saved = localStorage.getItem("mathTetrisSavedGame")
    setHasSavedGame(!!saved)
  }, []) // Simplificando funciones para evitar bucles infinitos

  const saveGame = useCallback(() => {
    const savedGame: SavedGame = {
      gameState,
      timestamp: Date.now(),
    }
    localStorage.setItem("mathTetrisSavedGame", JSON.stringify(savedGame))
    setHasSavedGame(true)
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }, [gameState])

  const loadGame = useCallback(() => {
    const saved = localStorage.getItem("mathTetrisSavedGame")
    if (saved) {
      const savedGame: SavedGame = JSON.parse(saved)
      setGameState(savedGame.gameState)
      setGameStarted(true)
      localStorage.removeItem("mathTetrisSavedGame")
      setHasSavedGame(false)
    }
  }, [])

  const checkAchievements = useCallback(
    (difficulty: Difficulty, points: number) => {
      const relevantAchievements = ACHIEVEMENTS.filter(
        (achievement) =>
          achievement.difficulty === difficulty &&
          points >= achievement.targetPoints &&
          !userProfile.achievements[achievement.id],
      )

      if (relevantAchievements.length > 0) {
        // Desbloquear el logro de mayor puntuación conseguido
        const highestAchievement = relevantAchievements.reduce((prev, current) =>
          current.targetPoints > prev.targetPoints ? current : prev,
        )

        const updatedProfile = {
          ...userProfile,
          achievements: {
            ...userProfile.achievements,
            [highestAchievement.id]: true,
          },
        }

        saveProfile(updatedProfile)
        setNewAchievement(highestAchievement)

        // Ocultar notificación después de 3 segundos
        setTimeout(() => setNewAchievement(null), 3000)
      }
    },
    [userProfile, saveProfile],
  )

  const updateMaxScore = useCallback(
    (currentPoints: number) => {
      const currentDifficultyMax = userProfile.maxPointsByDifficulty[gameState.difficulty]
      if (currentPoints > currentDifficultyMax) {
        const updatedProfile = {
          ...userProfile,
          maxPointsByDifficulty: {
            ...userProfile.maxPointsByDifficulty,
            [gameState.difficulty]: currentPoints,
          },
        }
        saveProfile(updatedProfile)

        checkAchievements(gameState.difficulty, currentPoints)
      }
    },
    [userProfile, gameState.difficulty, saveProfile, checkAchievements],
  )

  const shareOnWhatsApp = useCallback(() => {
    const message =
      `🎮 Math Tetris - Mi Perfil 🎮\n\n` +
      `🏆 Puntuaciones máximas por dificultad:\n` +
      `• Fácil: ${userProfile.maxPointsByDifficulty.easy}\n` +
      `• Medio: ${userProfile.maxPointsByDifficulty.medium}\n` +
      `• Difícil: ${userProfile.maxPointsByDifficulty.hard}\n` +
      `• Experto: ${userProfile.maxPointsByDifficulty.expert}\n` +
      `• Pesadilla: ${userProfile.maxPointsByDifficulty.nightmare}\n` +
      `• Pesadilla+: ${userProfile.maxPointsByDifficulty["nightmare+"]}\n` +
      `• Pesadilla++: ${userProfile.maxPointsByDifficulty["nightmare++"]}\n\n` +
      `¡Juega conmigo en Math Tetris!`

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }, [userProfile])

  const goBackToMenu = useCallback(() => {
    setGameStarted(false)
  }, [])

  useEffect(() => {
    loadProfile()
    checkSavedGame()
  }, []) // Simplificando useEffect para cargar datos iniciales

  const isValidPosition = useCallback((board: (number | null)[][], x: number, y: number) => {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT && board[y][x] === null
  }, [])

  const placeNumber = useCallback((board: (number | null)[][], number: number, x: number, y: number) => {
    const newBoard = board.map((row) => [...row])
    newBoard[y][x] = number
    return newBoard
  }, [])

  const checkForMatches = useCallback(
    (board: (number | null)[][], customTargetSum?: number) => {
      const targetSum = customTargetSum !== undefined ? customTargetSum : gameState.targetSum
      const newBoard = board.map((row) => [...row])
      let foundMatches = false
      let combinationsFound = 0
      let totalPointsEarned = 0
      const allMatchingPositions: { x: number; y: number }[] = []

      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x <= BOARD_WIDTH - 2; x++) {
          let sum = 0
          const numbers: { x: number; y: number }[] = []

          for (let i = x; i < BOARD_WIDTH; i++) {
            if (newBoard[y] && newBoard[y][i] !== null && newBoard[y][i] !== undefined) {
              sum += newBoard[y][i] || 0
              numbers.push({ x: i, y })

              if (sum === targetSum && numbers.length >= 2) {
                foundMatches = true
                combinationsFound += 1
                totalPointsEarned += numbers.length * 10
                allMatchingPositions.push(...numbers)
                numbers.forEach((pos) => {
                  if (newBoard[pos.y] && newBoard[pos.y][pos.x] !== undefined) {
                    newBoard[pos.y][pos.x] = null
                  }
                })
                break
              } else if (sum > targetSum) {
                break
              }
            } else {
              break
            }
          }
        }
      }

      for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let y = 0; y <= BOARD_HEIGHT - 2; y++) {
          let sum = 0
          const numbers: { x: number; y: number }[] = []

          for (let i = y; i < BOARD_HEIGHT; i++) {
            if (newBoard[i] && newBoard[i][x] !== null && newBoard[i][x] !== undefined) {
              sum += newBoard[i][x] || 0
              numbers.push({ x, y: i })

              if (sum === targetSum && numbers.length >= 2) {
                foundMatches = true
                combinationsFound += 1
                totalPointsEarned += numbers.length * 10
                allMatchingPositions.push(...numbers)
                numbers.forEach((pos) => {
                  if (newBoard[pos.y] && newBoard[pos.y][pos.x] !== undefined) {
                    newBoard[pos.y][pos.x] = null
                  }
                })
                break
              } else if (sum > targetSum) {
                break
              }
            } else {
              break
            }
          }
        }
      }

      return { newBoard, foundMatches, combinationsFound, totalPointsEarned, matchingPositions: allMatchingPositions }
    },
    [gameState.targetSum],
  )

  const applyGravity = useCallback((board: (number | null)[][]) => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))

    for (let x = 0; x < BOARD_WIDTH; x++) {
      const column = []
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y][x] !== null) {
          column.push(board[y][x])
        }
      }

      for (let i = 0; i < column.length; i++) {
        newBoard[BOARD_HEIGHT - 1 - i][x] = column[i]
      }
    }

    return newBoard
  }, [])

  const moveNumber = useCallback(
    (direction: "left" | "right" | "down") => {
      if (gameState.gameOver || gameState.isPaused || !gameStarted) return

      setGameState((prev) => {
        const newX =
          direction === "left"
            ? prev.currentPosition.x - 1
            : direction === "right"
              ? prev.currentPosition.x + 1
              : prev.currentPosition.x
        const newY = direction === "down" ? prev.currentPosition.y + 1 : prev.currentPosition.y

        if (isValidPosition(prev.board, newX, newY)) {
          return {
            ...prev,
            currentPosition: { x: newX, y: newY },
          }
        } else if (direction === "down") {
          const finalPosition = { x: prev.currentPosition.x, y: prev.currentPosition.y }

          const boardWithNumber = placeNumber(
            prev.board,
            prev.currentNumber,
            prev.currentPosition.x,
            prev.currentPosition.y,
          )
          const { newBoard, foundMatches, combinationsFound, totalPointsEarned, matchingPositions } =
            checkForMatches(boardWithNumber)

          if (foundMatches) {
            const newPoints = prev.points + totalPointsEarned
            updateMaxScore(newPoints)

            return {
              ...prev,
              board: boardWithNumber,
              matchingPositions: matchingPositions,
              finalPiecePosition: finalPosition,
              matchAnimation: true,
              isPaused: true,
              score: prev.score + combinationsFound,
              points: newPoints,
            }
          } else {
            const gameOver = checkGameOver(boardWithNumber)

            return {
              ...prev,
              board: boardWithNumber,
              currentNumber: prev.nextNumber,
              nextNumber: getRandomNumber(),
              currentPosition: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
              gameOver,
              matchingPositions: [],
              finalPiecePosition: undefined,
            }
          }
        }

        return prev
      })
    },
    [gameState.gameOver, gameState.isPaused, gameStarted, updateMaxScore], // Añadir updateMaxScore a dependencias
  )

  const checkGameOver = useCallback((board: (number | null)[][]) => {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[0][x] !== null) {
        return true
      }
    }
    return false
  }, [])

  useEffect(() => {
    if (gameState.matchAnimation) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          const finalBoard = applyGravity(
            prev.board.map((row) =>
              row.map((cell, x) => {
                const y = prev.board.indexOf(row)
                const isMatching = prev.matchingPositions.some((pos) => pos.x === x && pos.y === y)
                const isFinalPiece =
                  prev.finalPiecePosition && prev.finalPiecePosition.x === x && prev.finalPiecePosition.y === y
                return isMatching || isFinalPiece ? null : cell
              }),
            ),
          )

          const gameOver = checkGameOver(finalBoard)

          const newTargetSum =
            prev.gameMode === "changing"
              ? getRandomTarget()
              : prev.gameMode === "fixed"
                ? prev.initialTargetSum
                : prev.targetSum

          let updatedBoard = finalBoard
          let additionalScore = 0
          let additionalPoints = 0
          let hasImmediateMatches = false
          let allMatchingPositions: { x: number; y: number }[] = []

          if (prev.gameMode === "changing" && newTargetSum !== prev.targetSum) {
            const matchResult = checkForMatches(finalBoard, newTargetSum)

            if (matchResult.foundMatches) {
              hasImmediateMatches = true
              updatedBoard = applyGravity(matchResult.newBoard)
              additionalScore = matchResult.combinationsFound
              additionalPoints = matchResult.totalPointsEarned
              allMatchingPositions = matchResult.matchingPositions

              // Actualizar puntuación máxima si es necesario
              const newTotalPoints = prev.points + additionalPoints
              updateMaxScore(newTotalPoints)
            }
          }

          return {
            ...prev,
            board: updatedBoard,
            currentNumber: prev.nextNumber,
            nextNumber: getRandomNumber(),
            currentPosition: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
            targetSum: newTargetSum,
            gameOver: checkGameOver(updatedBoard),
            matchAnimation: hasImmediateMatches,
            isPaused: hasImmediateMatches,
            matchingPositions: hasImmediateMatches ? allMatchingPositions : [],
            finalPiecePosition: undefined,
            showTargetChange: prev.gameMode === "changing" && newTargetSum !== prev.targetSum && !hasImmediateMatches,
            score: prev.score + additionalScore,
            points: prev.points + additionalPoints,
          }
        })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState.matchAnimation, applyGravity, checkGameOver, checkForMatches, updateMaxScore])

  useEffect(() => {
    if (gameState.showTargetChange) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, showTargetChange: false }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState.showTargetChange])

  useEffect(() => {
    if (!gameStarted || gameState.gameOver || gameState.isPaused) return

    const interval = setInterval(() => {
      moveNumber("down")
    }, DIFFICULTY_SPEEDS[gameState.difficulty])

    return () => clearInterval(interval)
  }, [gameStarted, gameState.gameOver, gameState.isPaused, gameState.difficulty]) // Simplificando useEffect del movimiento automático

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          moveNumber("left")
          break
        case "ArrowRight":
          e.preventDefault()
          moveNumber("right")
          break
        case "ArrowDown":
          e.preventDefault()
          moveNumber("down")
          break
        case " ":
          e.preventDefault()
          setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameStarted, moveNumber])

  useEffect(() => {
    if (showSaveNotification) {
      const timer = setTimeout(() => {
        setShowSaveNotification(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showSaveNotification])

  const startGame = (difficulty: Difficulty, gameMode: GameMode) => {
    const initialTarget = getRandomTarget()
    setGameStarted(true)
    setGameState({
      board: Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null)),
      currentNumber: getRandomNumber(),
      currentPosition: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
      nextNumber: getRandomNumber(),
      targetSum: initialTarget,
      score: 0,
      points: 0,
      gameOver: false,
      isPaused: false,
      difficulty,
      gameMode,
      initialTargetSum: initialTarget,
      showTargetChange: false,
      matchAnimation: false,
      matchingPositions: [],
      finalPiecePosition: undefined,
    })
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameState({
      board: Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null)),
      currentNumber: getRandomNumber(),
      currentPosition: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
      nextNumber: getRandomNumber(),
      targetSum: getRandomTarget(),
      score: 0,
      points: 0,
      gameOver: false,
      isPaused: false,
      difficulty: "medium",
      gameMode: "fixed",
      initialTargetSum: 15,
      showTargetChange: false,
      matchAnimation: false,
      matchingPositions: [],
      finalPiecePosition: undefined,
    })
    localStorage.removeItem("mathTetrisSavedGame")
    setHasSavedGame(false)
  }

  const getNumberColor = () => "bg-blue-500"

  const getAchievementStats = useCallback(() => {
    const totalAchievements = ACHIEVEMENTS.length
    const unlockedAchievements = Object.keys(userProfile.achievements).filter(
      (key) => userProfile.achievements[key],
    ).length

    return { unlocked: unlockedAchievements, total: totalAchievements }
  }, [userProfile.achievements])

  if (showProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-primary mb-2">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">Puntuaciones máximas por dificultad</p>
          </div>

          <div className="space-y-3">
            {(["easy", "medium", "hard", "expert", "nightmare", "nightmare+", "nightmare++"] as Difficulty[]).map(
              (diff) => (
                <Card key={diff} className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {diff === "easy"
                        ? "Fácil"
                        : diff === "medium"
                          ? "Medio"
                          : diff === "hard"
                            ? "Difícil"
                            : diff === "expert"
                              ? "Experto"
                              : diff === "nightmare"
                                ? "Pesadilla"
                                : diff === "nightmare+"
                                  ? "Pesadilla+"
                                  : "Pesadilla++"}
                    </span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {userProfile.maxPointsByDifficulty[diff]}
                    </Badge>
                  </div>
                </Card>
              ),
            )}
          </div>

          <div className="space-y-2 mt-6">
            <Button onClick={shareOnWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
              📱 Compartir en WhatsApp
            </Button>
            <Button onClick={() => setShowProfile(false)} variant="outline" className="w-full">
              Volver al Menú
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (showAchievements) {
    const achievementStats = getAchievementStats()

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-primary mb-2">🏆 Logros</h1>
            <p className="text-sm text-muted-foreground">
              {achievementStats.unlocked} de {achievementStats.total} desbloqueados
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(achievementStats.unlocked / achievementStats.total) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {(["easy", "medium", "hard", "expert", "nightmare", "nightmare+", "nightmare++"] as Difficulty[]).map(
              (difficulty) => {
                const difficultyAchievements = ACHIEVEMENTS.filter((a) => a.difficulty === difficulty)
                const unlockedCount = difficultyAchievements.filter((a) => userProfile.achievements[a.id]).length

                return (
                  <div key={difficulty} className="space-y-1">
                    <h3 className="font-semibold text-sm">
                      {difficulty === "easy"
                        ? "Fácil"
                        : difficulty === "medium"
                          ? "Medio"
                          : difficulty === "hard"
                            ? "Difícil"
                            : difficulty === "expert"
                              ? "Experto"
                              : difficulty === "nightmare"
                                ? "Pesadilla"
                                : difficulty === "nightmare+"
                                  ? "Pesadilla+"
                                  : "Pesadilla++"}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({unlockedCount}/{difficultyAchievements.length})
                      </span>
                    </h3>

                    <div className="grid grid-cols-5 gap-1">
                      {difficultyAchievements.map((achievement) => {
                        const isUnlocked = userProfile.achievements[achievement.id]
                        return (
                          <div
                            key={achievement.id}
                            className={`
                              p-2 rounded text-center text-xs border transition-all
                              ${
                                isUnlocked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted text-muted-foreground border-muted"
                              }
                            `}
                            title={`${achievement.title}: ${achievement.description}`}
                          >
                            <div className="font-bold">{achievement.targetPoints}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              },
            )}
          </div>

          <Button onClick={() => setShowAchievements(false)} variant="outline" className="w-full">
            Volver al Menú
          </Button>
        </Card>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md w-full">
          <h1 className="text-3xl font-bold text-primary mb-4 text-center">Math Tetris</h1>

          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => setShowProfile(true)} variant="outline" size="sm">
                📊 Mi Perfil
              </Button>
              <Button onClick={() => setShowAchievements(true)} variant="outline" size="sm">
                🏆 Logros
              </Button>
            </div>
            {hasSavedGame && (
              <Button onClick={loadGame} variant="secondary" size="sm" className="w-full">
                📂 Continuar Partida
              </Button>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Dificultad:</h3>
            <div className="grid grid-cols-5 gap-2">
              {(["easy", "medium", "hard", "expert", "nightmare"] as Difficulty[]).map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className="text-xs"
                >
                  {diff === "easy"
                    ? "Fácil"
                    : diff === "medium"
                      ? "Medio"
                      : diff === "hard"
                        ? "Difícil"
                        : diff === "expert"
                          ? "Experto"
                          : "Pesadilla"}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["nightmare+", "nightmare++"] as Difficulty[]).map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                  className="text-xs"
                >
                  {diff === "nightmare+" ? "Pesadilla+" : "Pesadilla++"}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Modo de Juego:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedGameMode === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGameMode("fixed")}
              >
                Objetivo Fijo
              </Button>
              <Button
                variant={selectedGameMode === "changing" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGameMode("changing")}
              >
                Objetivo Variable
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedGameMode === "fixed"
                ? "El objetivo se mantiene igual durante toda la partida"
                : "El objetivo cambia cada vez que consigues una combinación"}
            </p>
          </div>

          <div className="space-y-3 text-left mb-4">
            <h2 className="text-lg font-semibold text-foreground">Instrucciones:</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Los números caen desde arriba</li>
              <li>• Usa las flechas ← → para mover</li>
              <li>• Usa ↓ para soltar más rápido</li>
              <li>• Suma números consecutivos para conseguir el objetivo</li>
              <li>• Solo se permiten sumas (horizontal o vertical)</li>
            </ul>
          </div>

          <Button onClick={() => startGame(selectedDifficulty, selectedGameMode)} className="w-full">
            Comenzar Juego
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-2">
      <div className="max-w-sm mx-auto space-y-3">
        <div className="flex gap-2">
          <Card className="flex-1 p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Combinaciones</p>
              <p className="text-lg font-bold text-primary">{gameState.score}</p>
            </div>
          </Card>

          <Card className="flex-1 p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Puntos</p>
              <p className="text-lg font-bold text-green-600">{gameState.points}</p>
            </div>
          </Card>

          <Card className="flex-1 p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Objetivo</p>
              <Badge
                variant="secondary"
                className={`text-sm px-2 py-1 transition-all duration-500 ${
                  gameState.showTargetChange ? "animate-bounce bg-green-500 text-white" : ""
                }`}
              >
                {gameState.targetSum}
              </Badge>
            </div>
          </Card>
        </div>

        <div className="flex gap-2">
          {gameState.difficulty !== "nightmare+" && gameState.difficulty !== "nightmare++" && (
            <Card className="flex-1 p-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Siguiente</p>
                <div
                  className={`
                    w-8 h-8 mx-auto rounded flex items-center justify-center text-sm font-bold text-white
                    ${getNumberColor()}
                  `}
                >
                  {gameState.nextNumber}
                </div>
              </div>
            </Card>
          )}

          <Card className="flex-1 p-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Máximo</p>
              <p className="text-sm font-bold text-yellow-600">
                {userProfile.maxPointsByDifficulty[gameState.difficulty]}
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-3 relative">
          {gameState.matchAnimation && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-green-500 text-white animate-pulse shadow-lg">¡Objetivo conseguido!</Badge>
            </div>
          )}

          {gameState.showTargetChange && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-green-500 text-white animate-bounce shadow-lg">¡Nuevo objetivo!</Badge>
            </div>
          )}

          {showSaveNotification && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-blue-500 text-white animate-pulse shadow-lg">¡Partida guardada!</Badge>
            </div>
          )}

          {newAchievement && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
              <Badge className="bg-yellow-500 text-white animate-bounce shadow-lg px-3 py-1">
                ¡{newAchievement.title}!
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-6 gap-1 bg-muted p-3 rounded-lg">
            {gameState.board.map((row, y) =>
              row.map((cell, x) => {
                const isCurrentPosition =
                  gameState.currentPosition.x === x &&
                  gameState.currentPosition.y === y &&
                  gameStarted &&
                  !gameState.gameOver

                const isMatchingPosition = gameState.matchingPositions.some((pos) => pos.x === x && pos.y === y)
                const isFinalPiece =
                  gameState.finalPiecePosition &&
                  gameState.finalPiecePosition.x === x &&
                  gameState.finalPiecePosition.y === y

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`
                      w-10 h-10 border border-border rounded flex items-center justify-center text-sm font-bold
                      ${
                        isFinalPiece && gameState.matchAnimation
                          ? "bg-yellow-500 text-white animate-pulse"
                          : isMatchingPosition && gameState.matchAnimation
                            ? "bg-green-500 text-white animate-pulse"
                            : isCurrentPosition
                              ? "bg-blue-500 text-white animate-pulse"
                              : cell !== null
                                ? `${getNumberColor()} text-white`
                                : "bg-card"
                      }
                    `}
                  >
                    {cell !== null ? cell : isCurrentPosition ? gameState.currentNumber : ""}
                  </div>
                )
              }),
            )}
          </div>
        </Card>

        <Card className="p-3">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveNumber("left")}
                disabled={gameState.gameOver || gameState.isPaused}
                className="h-12 text-lg"
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveNumber("down")}
                disabled={gameState.gameOver || gameState.isPaused}
                className="h-12 text-lg"
              >
                ↓
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveNumber("right")}
                disabled={gameState.gameOver || gameState.isPaused}
                className="h-12 text-lg"
              >
                →
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
                disabled={gameState.gameOver}
              >
                {gameState.isPaused ? "Reanudar" : "Pausar"}
              </Button>
              <Button variant="outline" size="sm" onClick={saveGame} disabled={gameState.gameOver}>
                💾 Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={goBackToMenu}>
                ← Volver
              </Button>
            </div>
          </div>
        </Card>

        {gameState.gameOver && (
          <Card className="p-3 border-destructive">
            <div className="text-center">
              <h3 className="text-lg font-bold text-destructive mb-2">¡Juego Terminado!</h3>
              <p className="text-sm text-muted-foreground mb-1">Combinaciones: {gameState.score}</p>
              <p className="text-sm text-muted-foreground mb-3">Puntos totales: {gameState.points}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const message = `🎮 ¡Acabo de conseguir ${gameState.points} puntos y ${gameState.score} combinaciones en Math Tetris! Modo: ${gameState.difficulty} 🎯\n\n¿Puedes superarme?`
                    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
                    window.open(url, "_blank")
                  }}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 mb-2"
                >
                  📱 Compartir Puntuación
                </Button>
                <Button onClick={resetGame} size="sm" className="w-full">
                  Jugar de Nuevo
                </Button>
              </div>
            </div>
          </Card>
        )}

        {gameState.isPaused && !gameState.gameOver && (
          <Card className="p-3 border-secondary">
            <div className="text-center">
              <h3 className="text-base font-bold text-secondary-foreground">Juego Pausado</h3>
              <p className="text-xs text-muted-foreground">Presiona ESPACIO o el botón para continuar</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
