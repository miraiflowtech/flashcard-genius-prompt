
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, Check, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GermanFlashcard {
  id: string;
  german_word: string;
  english_meaning: string;
  example_sentence: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StudyModeProps {
  flashcards: GermanFlashcard[];
  onBack: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ flashcards, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const { toast } = useToast();

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleCorrect = () => {
    setCorrectAnswers(correctAnswers + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrectAnswers(incorrectAnswers + 1);
    handleNext();
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
  };

  const exportFlashcards = () => {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `german-vocabulary-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Vocabulary Exported",
      description: "Your German vocabulary has been downloaded as a JSON file.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">German Vocabulary Study</h1>
                <p className="text-sm text-gray-600">
                  Word {currentIndex + 1} of {totalCards}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportFlashcards}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={resetStudy}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-900">{currentIndex + 1}</div>
              <div className="text-sm text-gray-500">Current</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-gray-900">{totalCards}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="relative h-96 cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of card - German word */}
              <Card className="absolute inset-0 backface-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50">
                <CardContent className="h-full flex flex-col justify-between p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={getDifficultyColor(currentCard.difficulty)}>
                      {currentCard.difficulty}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Click to see meaning
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {currentCard.german_word}
                      </h2>
                      <p className="text-lg text-gray-600">German Word</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      Deutsch
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card - English meaning and German sentence */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 shadow-2xl border-0 bg-gradient-to-br from-white to-green-50">
                <CardContent className="h-full flex flex-col justify-between p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Translation
                    </Badge>
                    <div className="text-sm text-gray-500">
                      How did you do?
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                          {currentCard.english_meaning}
                        </h3>
                        <p className="text-sm text-gray-600">English Meaning</p>
                      </div>
                      
                      <div className="border-t pt-6">
                        <p className="text-lg md:text-xl text-gray-800 leading-relaxed italic">
                          "{currentCard.example_sentence}"
                        </p>
                        <p className="text-sm text-gray-600 mt-2">German Example</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIncorrect();
                      }}
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Incorrect
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCorrect();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Correct
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              variant="outline"
              size="lg"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                German Vocabulary
              </p>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} of {totalCards}
              </p>
            </div>

            <Button
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              variant="outline"
              size="lg"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Completion Message */}
          {currentIndex === totalCards - 1 && isFlipped && (
            <div className="mt-8 text-center p-6 bg-blue-50 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                🎉 Vocabulary Session Complete!
              </h3>
              <p className="text-gray-600 mb-4">
                You've reviewed all {totalCards} German words. 
                Correct: {correctAnswers}, Incorrect: {incorrectAnswers}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={resetStudy} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Study Again
                </Button>
                <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                  Generate New Vocabulary
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
