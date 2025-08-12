def prompt_func(text_extract, topic_list, difficulty, number_of_questions):
    promptstr = f"""
###
You are about to be given a text extract.
The text was extracted using Optical Character Recognition (OCR). Therefore:
- Ignore any OCR-related text errors, formatting issues, or gibberish.
- Do not refer to any diagrams, figures, tables, or non-textual elements mentioned in the passage.
(The text extract starts after this line and ends when you encounter the exact phrase "ADAPTER TOOTHPASTE MEDICINE")
{text_extract}

ADAPTER TOOTHPASTE MEDICINE

###
Context:
You are an expert multiple-choice question (MCQ) generator trained to create factual, educational, and topic-focused questions using only the information provided in the text above.

###
Your Task:
Generate a set of {
        number_of_questions
    } high quality multiple-choice questions based on the text extract and the requested topics. Output them in a well-structured JSON array.

### Topic List
{topic_list}

###
Guidelines for Good MCQs:
- Questions should test understanding, recall, reasoning, or comparisons - not just trivial word matching.
- Distractors should be plausible but clearly wrong, not trivially false or obviously off-topic.
- Each option should have and clear meanings. There should be no ambiguity between the options.
- Refer the topic list given to you. Then find questions in the given extract related to topics. One question can map to multiple topics if needed.
- Choose ALL topics ONLY from the topic list that apply to the question, not just one. One question could have many topics applied to it.
- The explanation should:
  - Clearly justify why the correct answer is correct.
  - Briefly explain why each other option is incorrect.


###
Constraints:
- The format for the questions is given below. Make sure that you follow the correct format STRICTLY.

[
  {{
    "question": "...",
    "options": {{
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    }},
    "correct_answer": "B",
    "topics": ["..."],
    "explanation": "..."
  }}
]

  - `"topics"` field must be a list of ALL the topics that apply to the questions. Choose topics only from the following:
    {topic_list}
  - The `"explanation"` field will contain a brief explanation of why the correct option is the correct one and why the other options are wrong.
- Do not hallucinate or use any prior information for generating the questions.
- Double check the truthness of the correct answer and its explanation with the given extract before printing it out.
- Double check that the options of any question do not contradict with the explanation
- The difficulty level of the questions should be : {difficulty}
- Each question should have 4 options labelled A to D. Only one of these options should be correct and the other three should not be very obvious to be wrong.
- Only generate an array of EXACTLY {number_of_questions} questions. No more, no less.
- Repeating because this is very important, GIVE EXACTLY {
        number_of_questions
    } QUESTIONS in the array.
- Respond with ONLY the formatted JSON object. No commentary, explanation or surrounding text.

###
An example will now be given to you. Notice how every question follows the format strictly. Notice how the explanation explains all the options. Notice how the distractors are not too obvious to be wrong.
Even if the example only has an array of 2 questions, remember that you have to give an array of exactly
{number_of_questions} questions
Examples of formatted MCQ question arrays

{give_example(difficulty)}

"""
    return promptstr


def easy():
    return """

1. EASY QUESTION ARRAY
[
  {{
    "question": "Which of the following is true?",
    "options": {{
      "A": "2 + 0 = 5",
      "B": "5 - 3 = 2",
      "C": "6 + 4 = 7",
      "D": "7 = 8",
    }},
    "correct_answer": "B",
    "topics": ["Basic Mathematics", "Addition and Subtraction", "Mathematical equality"],
    "explanation": "Option B is the correct answer as the left hand side is equal to the right hand side of the equality. Option A states 2 = 5, which is false. Option C states 10 = 7, which is also false. Option D plainly states a wrong equality.",
  }},
  {{
    "question": "What is 9 + 6?",
    "options": {{
      "A": "12",
      "B": "14",
      "C": "15",
      "D": "16"
    }},
    "correct_answer": "C",
    "topics": ["Mathematics", "Addition", "Arithmetic"],
    "explanation": "9 + 6 equals 15, so option C is correct. The other options are common mistakes if someone adds incorrectly or forgets carrying over.",
  }}
]

    """


def medium():
    return """

2. MEDIUM QUESTION ARRAY

[
  {{
    "question": "All birds have feathers. Penguins are birds. Which of the following is true?",
    "options": {{
            "A": "Penguins do not have feathers.",
      "B": "All birds are penguins.",
      "C": "Penguins have feathers.",
      "D": "Some penguins can fly.",
    }},
    "correct_answer": "C",
    "topics": ["Logical Reasoning", "Syllogisms", "Verbal Deduction"],
    "explanation": "If all birds have feathers and penguins are birds, then penguins must have feathers.",
  }},
  {{
    "question": "Which part of the plant conducts photosynthesis?",
    "options": {{
        "A": "Roots",
        "B": "Stem",
        "C": "Leaves",
        "D": "Flowers"
    }},
      "correct_answer": "C",
      "topics": ["Biology", "Photosynthesis", "Plant Science"],
      "explanation": "Leaves contain chlorophyll and are the primary site for photosynthesis in most plants.",
  }}
]

    """


def hard():
    return """

3. HARD QUESTION ARRAY

[
    {{
      "question": "A train travels 120 km in 2 hours and then 180 km in 3 hours. What is the average speed for the entire journey?",
      "options": {{
        "A": "50 km/h",
        "B": "60 km/h",
        "C": "70 km/h",
        "D": "75 km/h",
      }},
      "correct_answer": "B",
      "topics": ["Mathematics", "Speed and Time", "Problem Solving"],
      "explanation": "Total distance is 300 km and total time is 5 hours. Average speed = 300 / 5 = 60 km/h.",
    }},
    {{
      "question": "Which of the following best describes 'utilitarianism'?",
      "options": {{
        "A": "An ethical theory where the end justifies the means",
        "B": "The belief in strict adherence to rules regardless of outcome",
        "C": "A focus on the greatest good for the greatest number",
        "D": "The idea that all actions are inherently wrong",
      }},
      "correct_answer": "C",
      "topics": ["Philosophy", "Ethics", "Moral Theories"],
      "explanation": "Utilitarianism is a moral theory that promotes actions that maximize happiness or utility for the majority.",
    }}
]

    """


def give_example(dif):
    if dif == "easy":
        return easy()
    if dif == "medium":
        return medium()
    return hard()
