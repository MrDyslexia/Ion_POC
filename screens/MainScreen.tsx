import React from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  StatusBar,
  Animated,
} from "react-native"
import {
  Mic,
  Square,
  Trash2,
  Settings,
  BarChart3,
  MessageSquare,
  Timer,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertTriangle,
  Plug,
  Waves,
  Radio,
  Loader,
} from "lucide-react-native"
import { useAudioStream } from "../hooks/useAudioStream_ion"
import DeviceInfo from "react-native-device-info"
import { NavigationBar } from "@zoontek/react-native-navigation-bar"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

const Sidebar: React.FC<{
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  backdropOpacity: Animated.Value
  sidebarTranslateX: Animated.Value
  stylesPhone: any
  stats: any
  currentHypotheses: string[]
  showSettings: boolean
  toggleSettings: () => void
  tempServerUrl: string
  setTempServerUrl: (url: string) => void
  isRecording: boolean
  handleServerUrlUpdate: () => void
}> = ({
  showSidebar,
  setShowSidebar,
  backdropOpacity,
  sidebarTranslateX,
  stylesPhone,
  stats,
  currentHypotheses,
  showSettings,
  toggleSettings,
  tempServerUrl,
  setTempServerUrl,
  isRecording,
  handleServerUrlUpdate,
}) => (
  <>
    {/* Animated backdrop overlay */}
    <Animated.View
      style={[stylesPhone.backdrop, { opacity: backdropOpacity }]}
      pointerEvents={showSidebar ? "auto" : "none"}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => setShowSidebar(false)}
      />
    </Animated.View>

    {/* Animated sidebar drawer */}
    <Animated.View
      style={[
        stylesPhone.sidebar,
        {
          transform: [{ translateX: sidebarTranslateX }],
        },
      ]}
    >
      <ScrollView style={stylesPhone.sidebarContent}>
        {/* Estadísticas */}
        <View style={stylesPhone.statsPanel}>
          <View style={stylesPhone.panelTitleContainer}>
            <BarChart3 size={18} color="#fff" style={stylesPhone.panelIcon} />
            <Text style={stylesPhone.panelTitle}>Estadísticas</Text>
          </View>
          <View style={stylesPhone.statItem}>
            <Waves size={16} color="#9ca3af" style={stylesPhone.statIconComponent} />
            <Text style={stylesPhone.statText}>Chunks: {stats.chunks}</Text>
          </View>
          <View style={stylesPhone.statItem}>
            <MessageSquare size={16} color="#9ca3af" style={stylesPhone.statIconComponent} />
            <Text style={stylesPhone.statText}>Transcripciones: {stats.transcriptions}</Text>
          </View>
          <View style={stylesPhone.statItem}>
            <Timer size={16} color="#9ca3af" style={stylesPhone.statIconComponent} />
            <Text style={stylesPhone.statText}>Tiempo: {stats.time}</Text>
          </View>
        </View>

        {/* Hipótesis alternativas */}
        {currentHypotheses.length > 0 && (
          <View style={stylesPhone.hypothesesPanel}>
            <View style={stylesPhone.panelTitleContainer}>
              <RefreshCw size={18} color="#fff" style={stylesPhone.panelIcon} />
              <Text style={stylesPhone.panelTitle}>Alternativas</Text>
            </View>
            {currentHypotheses.map((hyp, idx) => (
              <View key={hyp} style={stylesPhone.hypothesisItem}>
                <Text style={stylesPhone.hypothesisNumber}>{idx + 1}.</Text>
                <Text style={stylesPhone.hypothesisText}>{hyp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Configuración */}
        <View style={stylesPhone.settingsPanel}>
          <TouchableOpacity style={stylesPhone.settingsButton} onPress={toggleSettings}>
            <Settings size={18} color="#e5e5e5" style={stylesPhone.settingsIconComponent} />
            <Text style={stylesPhone.settingsText}>Configuración</Text>
          </TouchableOpacity>

          {showSettings && (
            <View style={stylesPhone.settingsContent}>
              <Text style={stylesPhone.settingsLabel}>URL del servidor:</Text>
              <TextInput
                style={stylesPhone.urlInput}
                value={tempServerUrl}
                onChangeText={setTempServerUrl}
                editable={!isRecording}
                placeholder="wss://techmark-ai.com/asr/ws"
              />
              <TouchableOpacity
                style={stylesPhone.updateButton}
                onPress={handleServerUrlUpdate}
                disabled={isRecording}
              >
                <Text style={stylesPhone.updateButtonText}>Actualizar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  </>
)

const PulseAnimation: React.FC<{ isActive: boolean; color: string }> = ({ isActive, color }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const opacityAnim = React.useRef(new Animated.Value(0.7)).current

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
      opacityAnim.setValue(0.7)
    }
  }, [isActive, pulseAnim, opacityAnim])

  if (!isActive) return null

  return (
    <Animated.View
      style={[
        stylesWatch.pulseRing,
        {
          borderColor: color,
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
        },
      ]}
    />
  )
}

const ConnectionAnimation: React.FC<{ isConnecting: boolean }> = ({ isConnecting }) => {
  const spinAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const opacityAnim = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    if (isConnecting) {
      // Rotación continua
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start()

      // Pulso suave
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      ).start()

      // Fade in/out
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      spinAnim.setValue(0)
      scaleAnim.setValue(1)
      opacityAnim.setValue(1)
    }
  }, [isConnecting, spinAnim, scaleAnim, opacityAnim])

  if (!isConnecting) return null

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Animated.View
      style={[
        stylesWatch.connectionSpinner,
        {
          transform: [{ rotate: spin }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Loader size={24} color="#788FA9" />
    </Animated.View>
  )
}

const AudioWaveIndicator: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const wave1 = React.useRef(new Animated.Value(0.3)).current
  const wave2 = React.useRef(new Animated.Value(0.5)).current
  const wave3 = React.useRef(new Animated.Value(0.7)).current

  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(wave1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(wave1, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.timing(wave2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(wave2, {
              toValue: 0.5,
              duration: 400,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.timing(wave3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(wave3, {
              toValue: 0.7,
              duration: 400,
              useNativeDriver: false,
            }),
          ]),
        ])
      ).start()
    } else {
      wave1.setValue(0.3)
      wave2.setValue(0.5)
      wave3.setValue(0.7)
    }
  }, [isActive, wave1, wave2, wave3])

  return (
    <View style={stylesWatch.audioWaveContainer}>
      <Animated.View
        style={[
          stylesWatch.audioWaveBar,
          {
            height: wave1.interpolate({
              inputRange: [0, 1],
              outputRange: ['20%', '100%'],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          stylesWatch.audioWaveBar,
          {
            height: wave2.interpolate({
              inputRange: [0, 1],
              outputRange: ['20%', '100%'],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          stylesWatch.audioWaveBar,
          {
            height: wave3.interpolate({
              inputRange: [0, 1],
              outputRange: ['20%', '100%'],
            }),
          },
        ]}
      />
    </View>
  )
}

const MainScreen: React.FC = () => {
  const defaultServerUrl = "wss://techmark-ai.com/asr/ws"
  const {
    isConnected,
    isRecording,
    error,
    messages,
    partialText,
    currentHypotheses,
    stats,
    serverUrl,
    showSettings,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearAll,
    updateServerUrl,
    toggleSettings,
  } = useAudioStream(defaultServerUrl)

  const [showSidebar, setShowSidebar] = React.useState<boolean>(false)
  const [tempServerUrl, setTempServerUrl] = React.useState<string>(serverUrl)
  const [isConnecting, setIsConnecting] = React.useState<boolean>(false)

  const sidebarTranslateX = React.useRef(new Animated.Value(-320)).current
  const backdropOpacity = React.useRef(new Animated.Value(0)).current

  const model = DeviceInfo.getModel()
  const palabrasClaveReloj = ["watch", "wear"]
  const esModeloDeReloj = palabrasClaveReloj.some((keyword) => model.toLowerCase().includes(keyword.toLowerCase()))

  React.useEffect(() => {
    if (showSidebar) {
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: -320,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showSidebar, sidebarTranslateX, backdropOpacity])

  const prevConnectedRef = React.useRef(isConnected)
  React.useEffect(() => {
    const prevConnected = prevConnectedRef.current
    if (prevConnected !== isConnected) {
      setIsConnecting(false)
    }
    prevConnectedRef.current = isConnected
  }, [isConnected])

  React.useEffect(() => {
    console.log("[v2] MainScreen: Montado, iniciando conexión a:", serverUrl)
    NavigationBar.setHidden(true)
    setIsConnecting(true)
    connect()
    // Simular tiempo de conexión
    setTimeout(() => setIsConnecting(false), 2000)

    return () => {
      console.log("[v2] MainScreen: Desmontando...")
    }
  }, [connect])

  const handleConnect = () => {
    setIsConnecting(true)
    connect()
    // Simular tiempo de conexión de 2 segundos
    setTimeout(() => setIsConnecting(false), 2000)
  }

  const handleServerUrlUpdate = () => {
    updateServerUrl(tempServerUrl)
    setIsConnecting(true)
    connect(tempServerUrl)
    setTimeout(() => setIsConnecting(false), 2000)
    toggleSettings()
  }

  const getStatusColor = () => {
    if (!esModeloDeReloj) return undefined
    if (isConnecting) return stylesWatch.connectingWatch
    if (isRecording) return stylesWatch.recordingWatch
    return isConnected ? stylesWatch.connectedWatch : stylesWatch.disconnectedWatch
  }

  const getStatusText = () => {
    if (isConnecting) return "Conectando..."
    if (isRecording) return "Grabando"
    return isConnected ? "Conectado" : "Desconectado"
  }

  const getStatusIcon = () => {
    if (isConnecting) return <Loader size={20} color="#fff" />
    if (isRecording) return <Waves size={20} color="#fff" />
    return isConnected ? <Radio size={20} color="#fff" /> : <Plug size={20} color="#fff" />
  }

  if (!esModeloDeReloj) {
    return (
      <SafeAreaView style={stylesPhone.container}>
        <StatusBar hidden={true} />
        <View style={stylesPhone.header}>
          <View style={stylesPhone.headerLeft}>
            <TouchableOpacity style={stylesPhone.sidebarToggle} onPress={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? <ChevronLeft size={20} color="#fff" /> : <ChevronRight size={20} color="#fff" />}
            </TouchableOpacity>
            <View style={stylesPhone.titleContainer}>
              <Mic size={20} color="#fff" style={stylesPhone.titleIcon} />
              <Text style={stylesPhone.title}>ION</Text>
            </View>
          </View>
          <View style={stylesPhone.connectionStatus}>
            <View
              style={[stylesPhone.statusDot, isConnected ? stylesPhone.connectedDot : stylesPhone.disconnectedDot]}
            />
            <Text style={stylesPhone.statusText}>{isConnected ? "Conectado" : "Desconectado"}</Text>
          </View>
        </View>

        <View style={stylesPhone.content}>
          <View style={stylesPhone.mainContent}>
            <ScrollView style={stylesPhone.messagesContainer}>
              {messages.length === 0 && partialText.length === 0 && (
                <View style={stylesPhone.emptyState}>
                  <Mic size={64} color="#6b7280" style={stylesPhone.emptyIconComponent} />
                  <Text style={stylesPhone.emptyTitle}>Comienza a hablar</Text>
                  <Text style={stylesPhone.emptyText}>
                    Presiona el botón de grabar y di algo para ver las transcripciones en tiempo real
                  </Text>
                  <View style={stylesPhone.legend}>
                    <View style={stylesPhone.legendItem}>
                      <View style={[stylesPhone.legendDot, stylesPhone.partialDot]} />
                      <Text style={stylesPhone.legendText}>Texto parcial (gris)</Text>
                    </View>
                    <View style={stylesPhone.legendItem}>
                      <View style={[stylesPhone.legendDot, stylesPhone.confirmedDot]} />
                      <Text style={stylesPhone.legendText}>Texto confirmado (blanco)</Text>
                    </View>
                    <View style={stylesPhone.legendItem}>
                      <View style={[stylesPhone.legendDot, stylesPhone.recognizedDot]} />
                      <Text style={stylesPhone.legendText}>Reconocido (verde)</Text>
                    </View>
                  </View>
                </View>
              )}

              {messages.map((message) => (
                <View key={message.id} style={stylesPhone.message}>
                  <View style={stylesPhone.messageHeader}>
                    <CheckCircle size={16} color="#10b981" style={stylesPhone.messageIconComponent} />
                    <Text style={stylesPhone.messageType}>Reconocido</Text>
                    <Text style={stylesPhone.messageTime}>{message.timestamp}</Text>
                  </View>
                  <Text style={stylesPhone.messageContent}>{message.text}</Text>
                </View>
              ))}

              {partialText.length > 0 && (
                <View style={stylesPhone.partialTextContainer}>
                  <View style={stylesPhone.partialLabel}>
                    <Waves size={16} color="#9ca3af" style={stylesPhone.pulseIconComponent} />
                    <Text style={stylesPhone.partialLabelText}>Transcribiendo...</Text>
                  </View>
                  <View style={stylesPhone.partialText}>
                    {partialText.map((chunk) => (
                      <Text
                        key={chunk.key}
                        style={[
                          stylesPhone.partialChunk,
                          chunk.confirmed ? stylesPhone.confirmedText : stylesPhone.partialTextStyle,
                        ]}
                      >
                        {chunk.text}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={stylesPhone.controls}>
              <TouchableOpacity
                style={[
                  stylesPhone.controlButton,
                  stylesPhone.recordButton,
                  isRecording && stylesPhone.recordingButton,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isRecording && !isConnected}
              >
                {isRecording ? (
                  <Square size={20} color="#fff" style={stylesPhone.controlButtonIconComponent} />
                ) : (
                  <Mic size={20} color="#fff" style={stylesPhone.controlButtonIconComponent} />
                )}
                <Text style={stylesPhone.controlButtonText}>{isRecording ? "Detener" : "Grabar"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesPhone.controlButton, stylesPhone.clearButton]}
                onPress={clearAll}
                disabled={isRecording}
              >
                <Trash2 size={20} color="#fff" style={stylesPhone.controlButtonIconComponent} />
                <Text style={stylesPhone.controlButtonText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showSidebar && (
            <Sidebar
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
              backdropOpacity={backdropOpacity}
              sidebarTranslateX={sidebarTranslateX}
              stylesPhone={stylesPhone}
              stats={stats}
              currentHypotheses={currentHypotheses}
              showSettings={showSettings}
              toggleSettings={toggleSettings}
              tempServerUrl={tempServerUrl}
              setTempServerUrl={setTempServerUrl}
              isRecording={isRecording}
              handleServerUrlUpdate={handleServerUrlUpdate}
            />
          )}
        </View>

        {error && (
          <View style={stylesPhone.errorContainer}>
            <View style={stylesPhone.errorContent}>
              <AlertTriangle size={16} color="#fca5a5" style={stylesPhone.errorIconComponent} />
              <Text style={stylesPhone.errorText}>{error}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={stylesWatch.container}>
      <ScrollView contentContainerStyle={stylesWatch.scrollContent}>
        {/* Header compacto con logo/nombre */}
        <View style={stylesWatch.headerWatch}>
          <Text style={stylesWatch.appName}>ION</Text>
        </View>

        {/* Indicador de estado principal con animaciones */}
        <View style={stylesWatch.statusContainer}>
          <View style={stylesWatch.statusRingContainer}>
            {isConnecting && <ConnectionAnimation isConnecting={isConnecting} />}
            <PulseAnimation isActive={isRecording} color="#27618E" />
            <View style={[stylesWatch.statusRing, getStatusColor()]}>
              <View style={stylesWatch.statusIconContainer}>{getStatusIcon()}</View>
            </View>
          </View>
          <Text style={stylesWatch.statusLabel}>{getStatusText()}</Text>
        </View>

        {/* Indicador visual de audio activo */}
        {isRecording && (
          <View style={stylesWatch.audioIndicatorContainer}>
            <AudioWaveIndicator isActive={isRecording} />
            <Text style={stylesWatch.audioIndicatorText}>Transmitiendo audio</Text>
          </View>
        )}

        {/* Estadísticas compactas cuando está grabando */}
        {isRecording && (
          <View style={stylesWatch.statsCompact}>
            <View style={stylesWatch.statCompactItem}>
              <Text style={stylesWatch.statCompactValue}>{stats.chunks}</Text>
              <Text style={stylesWatch.statCompactLabel}>Chunks</Text>
            </View>
            <View style={stylesWatch.statCompactDivider} />
            <View style={stylesWatch.statCompactItem}>
              <Text style={stylesWatch.statCompactValue}>{stats.transcriptions}</Text>
              <Text style={stylesWatch.statCompactLabel}>Textos</Text>
            </View>
          </View>
        )}

        {/* Botón de acción principal */}
        <View style={stylesWatch.mainActionContainer}>
          {(() => {
            if (isConnecting) {
              return (
                <View style={[stylesWatch.mainButton, stylesWatch.connectingButton]}>
                  <ConnectionAnimation isConnecting={isConnecting} />
                  <Text style={stylesWatch.mainButtonText}>Conectando</Text>
                </View>
              )
            } else if (!isConnected) {
              return (
                <TouchableOpacity
                  style={[stylesWatch.mainButton, stylesWatch.connectButton]}
                  onPress={handleConnect}
                  activeOpacity={0.8}
                >
                  <Plug size={28} color="#fff" style={stylesWatch.mainButtonIconComponent} />
                  <Text style={stylesWatch.mainButtonText}>Conectar</Text>
                </TouchableOpacity>
              )
            } else if (isRecording) {
              return (
                <TouchableOpacity
                  style={[stylesWatch.mainButton, stylesWatch.stopButton]}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <Square size={28} color="#fff" style={stylesWatch.mainButtonIconComponent} />
                  <Text style={stylesWatch.mainButtonText}>Detener</Text>
                </TouchableOpacity>
              )
            } else {
              return (
                <TouchableOpacity
                  style={[stylesWatch.mainButton, stylesWatch.recordButton]}
                  onPress={startRecording}
                  activeOpacity={0.8}
                >
                  <Mic size={28} color="#fff" style={stylesWatch.mainButtonIconComponent} />
                  <Text style={stylesWatch.mainButtonText}>Grabar</Text>
                </TouchableOpacity>
              )
            }
          })()}
        </View>

        {/* Botón secundario de desconexión */}
        {isConnected && !isRecording && !isConnecting && (
          <TouchableOpacity style={stylesWatch.secondaryButton} onPress={disconnect} activeOpacity={0.7}>
            <X size={14} color="#788FA9" style={stylesWatch.secondaryButtonIcon} />
            <Text style={stylesWatch.secondaryButtonText}>Desconectar</Text>
          </TouchableOpacity>
        )}

        {/* Mensajes de error */}
        {error && (
          <View style={stylesWatch.errorContainer}>
            <View style={stylesWatch.errorContent}>
              <AlertTriangle size={12} color="#fca5a5" style={stylesWatch.errorIconComponent} />
              <Text style={stylesWatch.errorText} numberOfLines={2}>
                {error}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Estilos para teléfono
const stylesPhone = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#2d2d2d",
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sidebarToggle: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectedDot: {
    backgroundColor: "#10b981",
  },
  disconnectedDot: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 998,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 320,
    backgroundColor: "#2d2d2d",
    borderRightWidth: 1,
    borderRightColor: "#404040",
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  statsPanel: {
    backgroundColor: "#3d3d3d",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  panelTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  panelIcon: {
    marginRight: 8,
  },
  panelTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconComponent: {
    marginRight: 8,
  },
  statText: {
    color: "#e5e5e5",
    fontSize: 14,
  },
  hypothesesPanel: {
    backgroundColor: "#3d3d3d",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  hypothesisItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#4d4d4d",
    borderRadius: 4,
  },
  hypothesisNumber: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 8,
    minWidth: 20,
  },
  hypothesisText: {
    color: "#e5e5e5",
    fontSize: 14,
    flex: 1,
  },
  settingsPanel: {
    backgroundColor: "#3d3d3d",
    padding: 16,
    borderRadius: 8,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsIconComponent: {
    marginRight: 8,
  },
  settingsText: {
    color: "#e5e5e5",
    fontSize: 16,
    fontWeight: "500",
  },
  settingsContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#555",
  },
  settingsLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: "#4d4d4d",
    color: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconComponent: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  legend: {
    width: "100%",
    maxWidth: 300,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  partialDot: {
    backgroundColor: "#6b7280",
  },
  confirmedDot: {
    backgroundColor: "#e5e5e5",
  },
  recognizedDot: {
    backgroundColor: "#10b981",
  },
  legendText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  message: {
    backgroundColor: "#3d3d3d",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageIconComponent: {
    marginRight: 8,
  },
  messageType: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  messageTime: {
    color: "#9ca3af",
    fontSize: 11,
  },
  messageContent: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  partialTextContainer: {
    backgroundColor: "#2d2d2d",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6b7280",
  },
  partialLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  pulseIconComponent: {
    marginRight: 8,
  },
  partialLabelText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  partialText: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  partialChunk: {
    fontSize: 14,
    lineHeight: 20,
    marginRight: 4,
  },
  partialTextStyle: {
    color: "#6b7280",
  },
  confirmedText: {
    color: "#e5e5e5",
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#2d2d2d",
    borderTopWidth: 1,
    borderTopColor: "#404040",
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  recordButton: {
    backgroundColor: "#ef4444",
  },
  recordingButton: {
    backgroundColor: "#10b981",
  },
  clearButton: {
    backgroundColor: "#6b7280",
  },
  controlButtonIconComponent: {
    marginRight: 8,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    padding: 12,
    margin: 16,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorIconComponent: {
    marginRight: 8,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
    flex: 1,
  },
})

const stylesWatch = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00234A", // prussian-blue
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  headerWatch: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#788FA9", // air-force-blue
    letterSpacing: 2,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  statusRingContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  pulseRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
  },
  connectionSpinner: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  statusRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#072C5C", // oxford-navy
  },
  statusIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  connectedWatch: {
    backgroundColor: "#27618E", // baltic-blue
  },
  disconnectedWatch: {
    backgroundColor: "#4D6C95", // smart-blue
    opacity: 0.5,
  },
  connectingWatch: {
    backgroundColor: "#4D6C95", // smart-blue
    opacity: 0.8,
  },
  recordingWatch: {
    backgroundColor: "#27618E", // baltic-blue
  },
  statusLabel: {
    fontSize: 11,
    color: "#788FA9", // air-force-blue
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  audioIndicatorContainer: {
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  audioWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    gap: 4,
    marginBottom: 4,
  },
  audioWaveBar: {
    width: 4,
    backgroundColor: "#788FA9", // air-force-blue
    borderRadius: 2,
  },
  audioIndicatorText: {
    fontSize: 9,
    color: "#4D6C95", // smart-blue
    fontWeight: "500",
  },
  statsCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#072C5C", // oxford-navy
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  statCompactItem: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  statCompactValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  statCompactLabel: {
    fontSize: 8,
    color: "#788FA9", // air-force-blue
    marginTop: 2,
  },
  statCompactDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#4D6C95", // smart-blue
  },
  mainActionContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 8,
  },
  mainButton: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    maxWidth: 120,
    maxHeight: 120,
    borderRadius: 1000,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderColor: "#072C5C", // oxford-navy
  },
  connectButton: {
    backgroundColor: "#4D6C95", // smart-blue
  },
  connectingButton: {
    backgroundColor: "#4D6C95", // smart-blue
    opacity: 0.8,
  },
  recordButton: {
    backgroundColor: "#27618E", // baltic-blue
  },
  stopButton: {
    backgroundColor: "#4D6C95", // smart-blue
  },
  mainButtonIconComponent: {
    marginBottom: 4,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#4D6C95", // smart-blue
  },
  secondaryButtonIcon: {
    marginRight: 4,
  },
  secondaryButtonText: {
    color: "#788FA9", // air-force-blue
    fontSize: 11,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: 6,
    borderRadius: 8,
    marginTop: 8,
    width: "95%",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconComponent: {
    marginRight: 4,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 9,
    textAlign: "center",
    flex: 1,
  },
})

export default MainScreen
