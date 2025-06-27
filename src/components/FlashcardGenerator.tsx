
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Settings, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashcardGeneratorProps {
  onBack: () => void;
  onFlashcardsGenerated: (flashcards: any[]) => void;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ onBack, onFlashcardsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('10');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [category, setCategory] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate flashcards for.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const systemPrompt = `You are an expert educational content creator specializing in generating high-quality flashcards for effective learning. Your task is to create flashcards that follow best practices in cognitive science and spaced repetition learning.

CORE PRINCIPLES:
- Use active recall techniques
- Create clear, concise questions
- Ensure answers are specific and accurate
- Apply the minimum information principle (one concept per card)
- Use varied question formats to enhance retention

OUTPUT FORMAT:
Always respond with valid JSON in this exact structure:
{
  "flashcards": [
    {
      "id": "unique_id",
      "front": "Question or prompt",
      "back": "Answer or explanation",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"],
      "category": "subject_category"
    }
  ]
}`;

      const userPrompt = `Generate ${count} flashcards about ${topic}.

Requirements:
- Subject: ${category || topic}
- Difficulty Level: ${difficulty}
- Question Types: mix of definitions, explanations, and applications
- Ensure comprehensive coverage of key concepts

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Please ensure the flashcards follow spaced repetition best practices and cover the topic thoroughly.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('Raw API response:', content);
      
      // Try to parse the JSON response
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Could not parse API response as JSON');
        }
      }

      if (parsedData.flashcards && Array.isArray(parsedData.flashcards)) {
        console.log('Generated flashcards:', parsedData.flashcards);
        onFlashcardsGenerated(parsedData.flashcards);
        toast({
          title: "Flashcards Generated!",
          description: `Successfully created ${parsedData.flashcards.length} flashcards for ${topic}.`,
        });
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Generate Flashcards</h1>
          <p className="text-gray-600">Configure your AI-powered flashcard generation</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Flashcard Configuration
              </CardTitle>
              <CardDescription>
                Customize your learning experience with AI-generated flashcards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Input */}
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  OpenAI API Key *
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Your API key is used to generate flashcards and is not stored anywhere.
                </p>
              </div>

              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic *
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Photosynthesis, JavaScript Promises, World War II"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-sm font-medium">
                    Number of Cards
                  </Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 cards</SelectItem>
                      <SelectItem value="10">10 cards</SelectItem>
                      <SelectItem value="15">15 cards</SelectItem>
                      <SelectItem value="20">20 cards</SelectItem>
                      <SelectItem value="25">25 cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty Level
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Subject Category
                    </Label>
                    <Input
                      id="category"
                      placeholder="e.g., Biology, Computer Science, History"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium">
                      AI Model
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Cheaper)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 (Higher Quality)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Best Balance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="context" className="text-sm font-medium">
                      Additional Context
                    </Label>
                    <Textarea
                      id="context"
                      placeholder="Any specific learning objectives, textbook chapters, or areas of emphasis..."
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      className="w-full"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={generateFlashcards}
                disabled={isGenerating || !topic.trim() || !apiKey.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardGenerator;
