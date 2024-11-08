"use client"

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, HelpCircle, Send } from "lucide-react"
import Image from "next/image"
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export default function Component() {
  const [activeSection, setActiveSection] = useState("multipleChoice")
  const [multipleChoiceAnswer, setMultipleChoiceAnswer] = useState("")
  const [fillInBlankAnswer, setFillInBlankAnswer] = useState("")
  const [showMultipleChoiceHint, setShowMultipleChoiceHint] = useState(false)
  const [showFillInBlankHint, setShowFillInBlankHint] = useState(false)
  const [showDragAndDropHint, setShowDragAndDropHint] = useState(false)
  const [progress, setProgress] = useState(0)
  const [aiFeedback, setAiFeedback] = useState("")
  const [userReply, setUserReply] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: "ai" | "user"; content: string }[]>([])
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false)
  const totalQuestions = 3

  const [dragAndDropMatches, setDragAndDropMatches] = useState<{ [key: string]: string | null }>({
    cpu: null,
    gpu: null,
    ram: null,
    ssd: null,
  });

  // Fetch data from the backend and log a message if successful
  useEffect(() => {
    fetch("http://localhost:8000/api/hello/") // Replace with your actual endpoint
      .then((response) => response.json())
      .then((data) => {
        console.log("Frontend received message from backend:", data.message);
      })
      .catch((error) => console.error("Error fetching data from backend:", error));
  }, []);

  const handleMultipleChoiceSubmit = () => {
    console.log("Multiple choice answer submitted:", multipleChoiceAnswer)
    setProgress(33)
    setQuestionsAnswered(1)
    setAnswerSubmitted(true)
    const isCorrect = multipleChoiceAnswer === "cpu"
    setIsAnswerCorrect(isCorrect)
    const feedback = isCorrect
      ? "Great job! You've correctly identified the component responsible for processing data. Let's move on to the next question."
      : "That's not quite right. An SSD stands for Solid State Drive. A drive stores and retrieves data, like documents, photos, videos, and software."
    setAiFeedback(feedback)
    setConversation([...conversation, { role: "ai", content: feedback }])
  }

  const handleFillInBlankSubmit = () => {
    console.log("Fill in the blank answer submitted:", fillInBlankAnswer)
    setProgress(66)
    setQuestionsAnswered(2)
    setAnswerSubmitted(true)
    const isCorrect = fillInBlankAnswer.toLowerCase() === "ram"
    setIsAnswerCorrect(isCorrect)
    const feedback = isCorrect
      ? "Excellent! You've correctly identified the component responsible for storing data that the computer is actively using. Let's move on to the final question."
      : "Not quite. The component responsible for storing data that the computer is actively using is different. Let's move on to the final question."
    setAiFeedback(feedback)
    setConversation([...conversation, { role: "ai", content: feedback }])
  }

  const handleDragAndDropSubmit = () => {
    console.log("Drag and drop answers submitted:", dragAndDropMatches)
    setProgress(100)
    setQuestionsAnswered(3)
    setAnswerSubmitted(true)
    const isCorrect = Object.entries(dragAndDropMatches).every(([key, value]) => key === value)
    setIsAnswerCorrect(isCorrect)
    const feedback = isCorrect
      ? "Excellent! You've correctly matched all the computer components with their images. You've completed the tutorial!"
      : "Some matches are incorrect. Review the components and their images, then try again."
    setAiFeedback(feedback)
    setConversation([...conversation, { role: "ai", content: feedback }])
  }

  const handleUserReply = () => {
    if (userReply.trim()) {
      setConversation([...conversation, { role: "user", content: userReply }])
      setUserReply("")
      // Simulate AI response (in a real app, this would be handled by an API call)
      setTimeout(() => {
        const aiResponse = "The brain of a computer handles all the processing and instructions that allow the computer to run programs and perform tasks. It controls and coordinates all other components of the system."
        setConversation(prev => [...prev, { role: "ai", content: aiResponse }])
      }, 1000)
    }
  }

  const getAnswerColor = (option: string) => {
    if (!answerSubmitted || multipleChoiceAnswer !== option) return "bg-white"
    return isAnswerCorrect ? "bg-green-100" : "bg-red-100"
  }

  interface DraggableLabelProps {
    label: string;
  }
  
  const DraggableLabel: React.FC<DraggableLabelProps> = ({ label }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "label",
      item: { label },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));
  
    const ref = useRef<HTMLDivElement>(null);
  
    // Attach drag to ref in useEffect to avoid type conflicts
    useEffect(() => {
      if (ref.current) {
        drag(ref);
      }
    }, [drag]);
  
    return (
      <div
        ref={ref}
        className={`p-2 m-1 bg-blue-500 text-white rounded cursor-move ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        {label}
      </div>
    );
  };

  const DroppableImage = ({ component, image }: { component: string; image: string }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "label",
      drop: (item: { label: string }) => {
        setDragAndDropMatches((prev) => ({ ...prev, [component]: item.label }));
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));
  
    const ref = useRef<HTMLDivElement>(null);
  
    // Attach drop to ref to avoid type conflicts
    useEffect(() => {
      if (ref.current) {
        drop(ref);
      }
    }, [drop]);
  
    return (
      <div
        ref={ref}
        className={`relative p-2 border-2 rounded ${isOver ? "border-green-500" : "border-gray-300"}`}
      >
        <Image src={image} alt={component} width={100} height={100} />
        <div className="mt-2 text-center">
          {dragAndDropMatches[component] || "Drop label here"}
        </div>
      </div>
    );
  };
  

  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">OverClockAI</h1>
        <div className="w-48 h-48 relative mb-6">
        <Image
            src="/Pic.png"
            alt="AI PC Building Tutor Icon"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <nav className="w-full">
          <h2 className="text-xl font-semibold mb-2">Module 1 - Terms</h2>
          <button
            className={`w-full text-left py-2 px-4 rounded ${
              activeSection === "multipleChoice" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("multipleChoice")}
          >
            Multiple Choice
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded ${
              activeSection === "fillInBlank" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("fillInBlank")}
          >
            Fill in the Blank
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded ${
              activeSection === "dragAndDrop" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveSection("dragAndDrop")}
          >
            Drag and Drop
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-2xl mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Progress</h2>
            <span className="text-sm font-medium text-gray-600">
              {questionsAnswered} of {totalQuestions} questions answered
            </span>
          </div>
          <div className="relative pt-1">
            <Progress value={progress} className="w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {activeSection === "multipleChoice" && (
          <Card className="w-full max-w-2xl mx-auto mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Multiple Choice Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-700">What component is responsible for processing data in a computer?</p>
              <RadioGroup value={multipleChoiceAnswer} onValueChange={setMultipleChoiceAnswer}>
                {["CPU (Central Processing Unit)", "GPU (Graphics Processing Unit)", "RAM (Random Access Memory)", "SSD (Solid State Drive)"].map((option) => (
                  <div key={option} className={`flex items-center space-x-2 p-3 rounded-lg border border-gray-200 ${getAnswerColor(option.split(" ")[0].toLowerCase())}`}>
                    <RadioGroupItem value={option.split(" ")[0].toLowerCase()} id={option.split(" ")[0].toLowerCase()} />
                    <Label htmlFor={option.split(" ")[0].toLowerCase()} className="flex-grow">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {showMultipleChoiceHint && (
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <HelpCircle className="inline mr-2" size={18} />
                  This component is often referred to as the "brain" of the computer.
                </p>
              )}
              <div className="flex space-x-2">
                <Button onClick={() => setShowMultipleChoiceHint(true)} variant="outline">
                  Hint
                </Button>
                <Button onClick={handleMultipleChoiceSubmit}>
                  Submit <ChevronRight className="ml-2" size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "fillInBlank" && (
          <Card className="w-full max-w-2xl mx-auto mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Fill in the Blank Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-700">
                The ______ is responsible for storing data that the computer is actively using.
              </p>
              <Input
                type="text"
                placeholder="Enter your answer"
                value={fillInBlankAnswer}
                onChange={(e) => setFillInBlankAnswer(e.target.value)}
                className={`bg-white border-gray-300 ${
                  answerSubmitted
                    ? isAnswerCorrect
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500"
                    : ""
                }`}
              />
              {showFillInBlankHint && (
                <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <HelpCircle className="inline mr-2" size={18} />
                  This component's name is an acronym that starts with 'R' and ends with 'M'.
                </p>
              )}
              <div className="flex space-x-2">
                <Button onClick={() => setShowFillInBlankHint(true)} variant="outline">
                  Hint
                </Button>
                <Button onClick={handleFillInBlankSubmit}>
                  Submit <ChevronRight className="ml-2" size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "dragAndDrop" && (
          <DndProvider backend={HTML5Backend}>
            <Card className="w-full max-w-2xl mx-auto mb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Drag and Drop Exercise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-700">Match the labels with the correct computer component images:</p>
                <div className="grid grid-cols-2 gap-4">
                  <DroppableImage component="cpu" image="/cpu.jpg" />
                  <DroppableImage component="gpu" image="/gpu.jpg" />
                  <DroppableImage component="ram" image="/ram.jpg" />
                  <DroppableImage component="ssd" image="/ssd.jpg" />
                </div>
                <div className="flex flex-wrap justify-center">
                  <DraggableLabel label="CPU" />
                  <DraggableLabel label="GPU" />
                  <DraggableLabel label="RAM" />
                  <DraggableLabel label="SSD" />
                </div>
                {showDragAndDropHint && (
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    <HelpCircle className="inline mr-2" size={18} />
                    Match the labels with the images based on the component's function and appearance.
                  </p>
                )}
                <div className="flex space-x-2">
                  <Button onClick={() => setShowDragAndDropHint(true)} variant="outline">
                    Hint
                  </Button>
                  <Button onClick={handleDragAndDropSubmit}>
                    Submit <ChevronRight className="ml-2" size={18} />
                  </Button>
                
                </div>
              </CardContent>
            </Card>
          </DndProvider>
        )}

        {conversation.length > 0 && (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">AI Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {conversation.map((message: { role: "ai" | "user"; content: string }, index: number) => (
  <div
    key={index}
    className={`p-3 rounded-lg ${
      message.role === "ai" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
    }`}
  >
                  <p className="font-semibold">{message.role === "ai" ? "AI" : "You"}:</p>
                  <p>{message.content}</p>
                </div>
              ))}
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your reply..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleUserReply}>
                  Send <Send className="ml-2" size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}