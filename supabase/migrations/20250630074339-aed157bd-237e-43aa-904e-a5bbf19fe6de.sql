
-- Create table to store flashcard sessions
CREATE TABLE public.flashcard_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  flashcard_count INTEGER NOT NULL DEFAULT 0
);

-- Create table to store individual flashcards from sessions
CREATE TABLE public.session_flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.flashcard_sessions(id) ON DELETE CASCADE NOT NULL,
  german_word TEXT NOT NULL,
  english_meaning TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for flashcard_sessions
ALTER TABLE public.flashcard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
  ON public.flashcard_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.flashcard_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.flashcard_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for session_flashcards
ALTER TABLE public.session_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcards from their sessions" 
  ON public.session_flashcards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sessions 
      WHERE flashcard_sessions.id = session_flashcards.session_id 
      AND flashcard_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create flashcards for their sessions" 
  ON public.session_flashcards 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sessions 
      WHERE flashcard_sessions.id = session_flashcards.session_id 
      AND flashcard_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flashcards from their sessions" 
  ON public.session_flashcards 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sessions 
      WHERE flashcard_sessions.id = session_flashcards.session_id 
      AND flashcard_sessions.user_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX idx_flashcard_sessions_user_created ON public.flashcard_sessions(user_id, created_at DESC);
CREATE INDEX idx_session_flashcards_session ON public.session_flashcards(session_id);
