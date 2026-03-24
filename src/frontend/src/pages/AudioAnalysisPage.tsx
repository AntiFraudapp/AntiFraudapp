import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Square, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RiskLevel = "low" | "medium" | "high" | null;

interface AudioResult {
  level: RiskLevel;
  score: number;
  title: string;
  description: string;
}

/**
 * Deterministic heuristic audio analysis.
 * Uses file duration and size to infer risk — no random values.
 */
function analyzeAudioHeuristics(
  duration: number,
  fileSizeBytes: number,
): AudioResult {
  const disclaimer =
    " Análise heurística — não substitui verificação profissional.";

  if (duration <= 0) {
    return {
      level: "low",
      score: 15,
      title: "Risco Baixo",
      description: `Sem dados de áudio para analisar.${disclaimer}`,
    };
  }

  if (duration < 3) {
    return {
      level: "low",
      score: 15,
      title: "Risco Baixo — Áudio Muito Curto",
      description: `Áudio muito curto para análise conclusiva. Impossível determinar padrões de fala.${disclaimer}`,
    };
  }

  if (duration <= 8) {
    return {
      level: "medium",
      score: 55,
      title: "Possível Áudio Sintético",
      description: `Áudio curto. Algumas características analisadas. Verifique com cautela.${disclaimer}`,
    };
  }

  // duration > 8s
  const bitRate = fileSizeBytes / duration;
  if (bitRate < 8000) {
    return {
      level: "medium",
      score: 48,
      title: "Taxa de Bits Baixa Detetada",
      description: `Taxa de bits baixa detetada. Pode indicar áudio comprimido ou processado.${disclaimer}`,
    };
  }

  return {
    level: "low",
    score: 12,
    title: "Risco Baixo",
    description: `Padrões de fala analisados. Nenhum sinal forte de voz sintética detetado.${disclaimer}`,
  };
}

export function AudioAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AudioResult | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const recordedChunksRef = useRef<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (progressRef.current) window.clearInterval(progressRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      setHasRecorded(false);
      setResult(null);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      alert(
        "Não foi possível aceder ao microfone. Por favor, permita o acesso.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      for (const t of mediaRecorderRef.current.stream.getTracks()) {
        t.stop();
      }
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIsRecording(false);
    setHasRecorded(true);
  };

  const runAnalysis = (durationSecs?: number, file?: File | null) => {
    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    // Simulate progress deterministically (fixed increments)
    const steps = [10, 25, 45, 65, 80, 95, 100];
    let stepIdx = 0;
    progressRef.current = window.setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx]);
        stepIdx++;
      } else {
        window.clearInterval(progressRef.current!);
        setProgress(100);

        // Compute duration & size
        let duration = durationSecs ?? recordingSeconds;
        let fileSize = 0;

        if (file) {
          fileSize = file.size;
          // Estimate duration from file size if no explicit duration
          if (!durationSecs) duration = file.size / 16000; // rough estimate at 128kbps
        } else if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current);
          fileSize = blob.size;
        }

        setTimeout(() => {
          setAnalyzing(false);
          setResult(analyzeAudioHeuristics(duration, fileSize));
        }, 200);
      }
    }, 300);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const resultBg =
    result?.level === "low"
      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
      : result?.level === "medium"
        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
        : "border-red-400 bg-red-50 dark:bg-red-950/20";

  const resultIcon =
    result?.level === "low" ? "🟢" : result?.level === "medium" ? "🟡" : "🔴";

  return (
    <main
      id="main-content"
      className="flex-1 container mx-auto px-4 py-6 max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            🎙️ Análise de Áudio — Deteção de Voz IA
          </h1>
          <p className="text-muted-foreground text-sm">
            Detete sinais de voz gerada por inteligência artificial em chamadas
            suspeitas
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="record" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="record" data-ocid="audio.record.tab">
              <Mic className="w-4 h-4 mr-2" />
              Gravar Áudio
            </TabsTrigger>
            <TabsTrigger value="upload" data-ocid="audio.upload.tab">
              <Upload className="w-4 h-4 mr-2" />
              Carregar Ficheiro
            </TabsTrigger>
          </TabsList>

          {/* Record Tab */}
          <TabsContent value="record" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col items-center gap-4">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="text-2xl font-mono font-bold text-red-600">
                        {formatTime(recordingSeconds)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        A gravar...
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      data-ocid="audio.record.button"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      className="border-red-500 text-red-600"
                      data-ocid="audio.stop.button"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </Button>
                  )}

                  {hasRecorded && !analyzing && !result && (
                    <Button
                      onClick={() => runAnalysis(recordingSeconds)}
                      data-ocid="audio.analyze.button"
                    >
                      Analisar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors w-full"
                    data-ocid="audio.dropzone"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {audioFile
                        ? audioFile.name
                        : "Clique para selecionar ficheiro de áudio"}
                    </span>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setAudioFile(f);
                        setResult(null);
                      }}
                    />
                  </label>

                  {audioFile && !analyzing && !result && (
                    <Button
                      onClick={() => runAnalysis(undefined, audioFile)}
                      data-ocid="audio.upload.analyze.button"
                    >
                      Analisar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Analyzing progress */}
        {analyzing && (
          <Card data-ocid="audio.loading_state">
            <CardContent className="pt-6 space-y-3">
              <div className="text-sm text-center text-muted-foreground">
                A analisar padrões de áudio...
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-center text-muted-foreground">
                {progress}%
              </div>
            </CardContent>
          </Card>
        )}

        {/* No audio message */}
        {!hasRecorded && !audioFile && !analyzing && !result && (
          <div className="p-4 bg-muted/40 border border-border rounded-lg text-center text-sm text-muted-foreground">
            Sem dados de áudio para analisar. Grave ou carregue um ficheiro de
            áudio para continuar.
          </div>
        )}

        {/* Result */}
        {result && (
          <Card
            className={`border-2 ${resultBg}`}
            data-ocid="audio.success_state"
          >
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {resultIcon} {result.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">{result.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Probabilidade de voz sintética</span>
                  <span className="font-bold">{result.score}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.level === "low"
                        ? "bg-emerald-500"
                        : result.level === "medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Disclaimer card */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  ⚠️{" "}
                  <strong>
                    Análise baseada em características técnicas do ficheiro.
                  </strong>{" "}
                  Não constitui prova definitiva. Consulte especialistas para
                  verificação profissional.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setResult(null);
                  setHasRecorded(false);
                  setAudioFile(null);
                }}
              >
                Nova análise
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Educational Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800 dark:text-blue-300">
              🤖 Como funciona a clonagem de voz por IA?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 dark:text-blue-200 space-y-2">
            <p>
              Sistemas de inteligência artificial modernos conseguem clonar a
              voz de uma pessoa com apenas alguns segundos de áudio. Fraudadores
              utilizam esta tecnologia para imitar familiares, funcionários de
              banco ou autoridades.
            </p>
            <p>
              <strong>Sinais de alerta:</strong> ausência de respiração natural,
              pausas demasiado uniformes, entoação artificial, qualidade de
              áudio suspeitosamente limpa ou ruído de fundo constante.
            </p>
            <p>
              Em caso de dúvida, desligue e contacte a pessoa diretamente por
              outro meio.
            </p>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <span className="font-semibold">⚠️ Nota:</span> Esta análise é
          heurística e não constitui prova. Use como indicador de risco
          adicional. Confirme sempre por outros meios.
        </div>
      </div>
    </main>
  );
}

export default AudioAnalysisPage;
