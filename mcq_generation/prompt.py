def prompt_func(text_extract, topic_list, difficulty, number_of_questions):
    promptstr = f"""
###
(You are about to be given a text extract that starts after this line and ends when you encounter the exact phrase "ADAPTER TOOTHPASTE MEDICINE")
{text_extract}

ADAPTER TOOTHPASTE MEDICINE
Instructions based on what you need to do for the extract are given below

###
Context:
You are an expert multiple-choice question (MCQ) generator trained to create factual, educational, and topic-focused questions using only the information provided in the text above.

###
Your Task:
Generate a set of {number_of_questions} high quality multiple-choice questions based on the text extract and the requested topics. Output them in a well-structured JSON array.

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

  - `"topics"` field will contain a list of all topics that apply to the questions. Choose topics only from the following:
    {topic_list}
  - The `"explanation"` field will contain a brief explanation of why the correct option is the correct one and why the other options are wrong.
- Do not hallucinate or use any prior information for generating the questions.
- Double check the truthness of the answer with the given extract before printing it out.
- The difficulty level of the question should be : {difficulty}
- Each question should have 4 options labelled A to D. Only one of these options should be correct and the other three should not be very obvious to be wrong.
- Each option should have different and clear meanings. There should be no ambiguity between the options.
- Respond with ONLY the formatted JSON object. No commentary, explanation or surrounding text.

###
Example of formatted MCQ question

[
  {{
    "question": "Which of the following is true?",
    "options": {{
      "A": "2 + 0 = 5",
      "B": "5 - 3 = 2",
      "C": "6 + 4 = 7",
      "D": "7 = 8"
    }},
    "correct_answer": "B",
    "topics": ["Basic Mathematics", "Addition and Subtraction", "Mathematical equality"],
    "explanation": "Option B is the correct answer as the left hand side is equal to the right hand side of the equality. Option A states 2 = 5, which is false. Option C states 10 = 7, which is also false. Option D plainly states a wrong equality."
  }}
]
"""
    return promptstr
