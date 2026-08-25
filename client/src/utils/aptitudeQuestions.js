/**
 * Predefined Multiple Choice Questions for TCS NQT Assessment Rounds (Client Side)
 * 
 * - Round 1: Numerical Ability (20 questions)
 * - Round 2: Verbal Ability (25 questions)
 * - Round 3: Reasoning Ability (20 questions)
 * - Round 4: Advanced Quantitative Ability (10 questions)
 * - Round 5: Advanced Reasoning Ability (10 questions)
 */

const aptitudeQuestions = {
  // ROUND 1: NUMERICAL ABILITY (20 Questions)
  quantitative: [
    { id: 1, question: "If a person sells an article for $360 and gains 20%, what was the cost price of the article?", options: ["$280", "$300", "$320", "$340"], correctOption: 1 },
    { id: 2, question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 meters", "150 meters", "324 meters", "180 meters"], correctOption: 1 },
    { id: 3, question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?", options: ["4 years", "8 years", "10 years", "None of these"], correctOption: 0 },
    { id: 4, question: "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?", options: ["12 days", "15 days", "16 days", "18 days"], correctOption: 1 },
    { id: 5, question: "A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is:", options: ["$650", "$690", "$698", "$700"], correctOption: 2 },
    { id: 6, question: "Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new numbers are in the ratio 12 : 23. The smaller number is:", options: ["27", "33", "49", "55"], correctOption: 1 },
    { id: 7, question: "The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?", options: ["0", "1", "10", "19"], correctOption: 3 },
    { id: 8, question: "Find the odd man out: 3, 5, 11, 14, 17, 21", options: ["14", "17", "21", "11"], correctOption: 0 },
    { id: 9, question: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.", options: ["2 hours", "3 hours", "4 hours", "5 hours"], correctOption: 2 },
    { id: 10, question: "How many times in a day, are the hands of a clock in a straight line but opposite in direction?", options: ["20", "22", "24", "44"], correctOption: 1 },
    { id: 11, question: "Three unbiased coins are tossed. What is the probability of getting at most two heads?", options: ["3/4", "7/8", "1/2", "3/8"], correctOption: 1 },
    { id: 12, question: "A tank is filled in 5 hours by three pipes A, B and C. The pipe C is twice as fast as B and B is twice as fast as A. How much time will pipe A alone take to fill the tank?", options: ["20 hours", "25 hours", "35 hours", "None of these"], correctOption: 2 },
    { id: 13, question: "The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:", options: ["15", "16", "18", "25"], correctOption: 1 },
    { id: 14, question: "In how many ways can the letters of the word 'LEADER' be arranged?", options: ["72", "144", "360", "720"], correctOption: 2 },
    { id: 15, question: "A card is drawn from a pack of 52 cards. The probability of getting a queen of club or a king of heart is:", options: ["1/13", "2/13", "1/26", "1/52"], correctOption: 2 },
    { id: 16, question: "If 15% of 40 is greater than 25% of a number by 2, then the number is:", options: ["12", "16", "24", "32"], correctOption: 1 },
    { id: 17, question: "If the radius of a circle is increased by 20%, then its area is increased by:", options: ["40%", "44%", "20%", "48%"], correctOption: 1 },
    { id: 18, question: "A shopkeeper marks his goods 20% above the cost price and allows a discount of 10% on the marked price. His profit percentage is:", options: ["8%", "10%", "12%", "15%"], correctOption: 0 },
    { id: 19, question: "Find the compound interest on $10,000 for 2 years at 10% per annum compounded annually.", options: ["$2,000", "$2,100", "$2,200", "$2,500"], correctOption: 1 },
    { id: 20, question: "A can run 22.5 meters while B runs 25 meters. In a 1000-meter race, B beats A by how many meters?", options: ["50 meters", "75 meters", "100 meters", "125 meters"], correctOption: 2 }
  ],

  // ROUND 2: VERBAL ABILITY (25 Questions)
  verbal: [
    { id: 1, question: "Choose the synonym of 'CANDID':", options: ["Secretive", "Frank", "Polite", "Guarded"], correctOption: 1 },
    { id: 2, question: "Choose the antonym of 'BENEVOLENT':", options: ["Kind", "Malevolent", "Generous", "Helpful"], correctOption: 1 },
    { id: 3, question: "Select the correctly spelled word:", options: ["Receive", "Recieve", "Receve", "Reiceve"], correctOption: 0 },
    { id: 4, question: "Complete the sentence: 'He had to walk _____ because the floor was wet.'", options: ["cautiously", "quickly", "carelessly", "clumsily"], correctOption: 0 },
    { id: 5, question: "Choose the alternative which best expresses the meaning of the idiom: 'To spill the beans'", options: ["To perform magic", "To waste money", "To reveal a secret prematurely", "To cause an accident"], correctOption: 2 },
    { id: 6, question: "Find the error: 'None of the two candidates (A) / who were interviewed (B) / was found suitable. (C) / No error (D)'", options: ["A", "B", "C", "D"], correctOption: 0 },
    { id: 7, question: "Fill in the blank: 'I have not seen him _____ last Wednesday.'", options: ["for", "since", "from", "till"], correctOption: 1 },
    { id: 8, question: "Choose the one which can be substituted for the phrase: 'A person who hates mankind'", options: ["Misanthrope", "Philanthropist", "Optimist", "Misogynist"], correctOption: 0 },
    { id: 9, question: "Complete the sentence: 'Although the weather was bad, they decided to go _____ their trip.'", options: ["ahead with", "through with", "in for", "away with"], correctOption: 0 },
    { id: 10, question: "Choose the synonym of 'FRUGAL':", options: ["Extravagant", "Generous", "Economical", "Spendthrift"], correctOption: 2 },
    { id: 11, question: "Identify the antonym of 'VAGUE':", options: ["Unclear", "Definite", "Obscure", "Blurry"], correctOption: 1 },
    { id: 12, question: "Fill in the blank: 'The manager was angry _____ his secretary for making mistakes.'", options: ["with", "at", "on", "against"], correctOption: 0 },
    { id: 13, question: "Choose the one which best expresses the active voice: 'The gate was opened by the watchman.'", options: ["The watchman opens the gate.", "The watchman opened the gate.", "The watchman was opening the gate.", "The gate opened the watchman."], correctOption: 1 },
    { id: 14, question: "Complete the sentence: 'Had I known about the meeting, I _____ attended it.'", options: ["will have", "would have", "should", "must"], correctOption: 1 },
    { id: 15, question: "Find the misspelled word:", options: ["Accommodation", "Beginning", "Occurrence", "Tommorow"], correctOption: 3 },
    { id: 16, question: "Identify the part of speech for the capitalized word: 'She walked QUICKLY to the store.'", options: ["Adjective", "Adverb", "Verb", "Noun"], correctOption: 1 },
    { id: 17, question: "Choose the correct preposition: 'She is good _____ playing the piano.'", options: ["at", "in", "on", "with"], correctOption: 0 },
    { id: 18, question: "Choose the synonym of 'ABUNDANT':", options: ["Scarce", "Plentiful", "Rare", "Limited"], correctOption: 1 },
    { id: 19, question: "Fill in the blank: 'If it _____ tomorrow, we will cancel the picnic.'", options: ["rains", "rain", "rained", "will rain"], correctOption: 0 },
    { id: 20, question: "Choose the antonym of 'ARTIFICIAL':", options: ["Natural", "Synthetic", "Man-made", "Fake"], correctOption: 0 },
    { id: 21, question: "Find the synonym of 'OBSTINATE':", options: ["Flexible", "Stubborn", "Compliant", "Yielding"], correctOption: 1 },
    { id: 22, question: "Complete the sentence: 'The team worked _____ to finish the project on time.'", options: ["diligently", "hardly", "lazy", "slackly"], correctOption: 0 },
    { id: 23, question: "Choose the correctly spelled word:", options: ["Lieutenant", "Leutenant", "Lutenant", "Lieutanant"], correctOption: 0 },
    { id: 24, question: "Choose the meaning of the idiom: 'Beat around the bush'", options: ["To plant trees", "To speak in a round-about way", "To clean the garden", "To make a decision quickly"], correctOption: 1 },
    { id: 25, question: "Fill in the blank: 'Neither of the answers _____ correct.'", options: ["is", "are", "were", "am"], correctOption: 0 }
  ],

  // ROUND 3: REASONING ABILITY (20 Questions)
  reasoning: [
    { id: 1, question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["1/3", "1/8", "2/8", "1/16"], correctOption: 1 },
    { id: 2, question: "If 'TIGER' is written as 'QDFHS' in a code, how is 'FISH' written in that code?", options: ["GERH", "GRHE", "HRGE", "EGRH"], correctOption: 1 },
    { id: 3, question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His son's", "His father's", "His nephew's"], correctOption: 1 },
    { id: 4, question: "A man walks 2 km North, then turns East and walks 10 km. After this, he turns North and walks 3 km. Finally, he turns East and walks 2 km. How far is he from the starting point?", options: ["10 km", "13 km", "15 km", "17 km"], correctOption: 1 },
    { id: 5, question: "Find the missing number in the sequence: 4, 9, 20, 43, 90, ?", options: ["180", "182", "185", "187"], correctOption: 2 },
    { id: 6, question: "Choose the word that is necessary for the given word: 'BOOK'", options: ["Fiction", "Pages", "Pictures", "Learning"], correctOption: 1 },
    { id: 7, question: "Statements: All bags are pockets. All pockets are pouches. Conclusion I: All bags are pouches. Conclusion II: Some pouches are pockets.", options: ["Only I follows", "Only II follows", "Neither I nor II follows", "Both I and II follow"], correctOption: 3 },
    { id: 8, question: "Four defensive football players are chasing the opposing quarterback. If Player A is faster than Player B, Player B is slower than Player C, and Player C is faster than Player A, who is the fastest?", options: ["Player A", "Player B", "Player C", "Cannot be determined"], correctOption: 2 },
    { id: 9, question: "Which of the following is the odd one out?", options: ["December", "August", "July", "November"], correctOption: 3 },
    { id: 10, question: "In a class of 45 students, Amir's rank is 16th from the top. What is his rank from the bottom?", options: ["29th", "30th", "31st", "32nd"], correctOption: 1 },
    { id: 11, question: "If A + B means A is the brother of B; A - B means A is the sister of B; A * B means A is the father of B. Which of the following means C is the son of M?", options: ["M - N * C", "M * C - N", "C * N - M", "M * C + N"], correctOption: 3 },
    { id: 12, question: "If Monday falls on the 1st of a month, what day will fall on the 25th of the same month?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correctOption: 0 },
    { id: 13, question: "Arrange the words in a meaningful logical order: 1. Birth, 2. Death, 3. Funeral, 4. Marriage, 5. Education", options: ["1, 5, 4, 2, 3", "1, 4, 5, 2, 3", "1, 5, 2, 4, 3", "2, 3, 4, 5, 1"], correctOption: 0 },
    { id: 14, question: "If English alphabet is written in reverse order, which letter will be the 5th to the left of the 14th letter from the right?", options: ["S", "R", "I", "H"], correctOption: 0 },
    { id: 15, question: "If 'Sky' is 'Star', 'Star' is 'Cloud', 'Cloud' is 'Earth', 'Earth' is 'Tree' and 'Tree' is 'Book', where do birds fly?", options: ["Sky", "Earth", "Star", "Tree"], correctOption: 2 },
    { id: 16, question: "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?", options: ["7", "10", "12", "13"], correctOption: 1 },
    { id: 17, question: "Find the odd one out: Geometry, Algebra, Arithmetic, Mathematics", options: ["Geometry", "Algebra", "Arithmetic", "Mathematics"], correctOption: 3 },
    { id: 18, question: "A, B, C, D and E are sitting on a bench. A is next to B, C is next to D, D is not sitting with E who is on the left end of the bench. C is on the second position from the right. A is to the right of B and E. A and C are sitting together. In which position is A sitting?", options: ["Between B and D", "Between B and C", "Between E and D", "Between C and E"], correctOption: 1 },
    { id: 19, question: "Find the next term: B2CD, _, BBCD4, B5CD", options: ["BC2D", "B2C2D", "BC3D", "BC2D4"], correctOption: 0 },
    { id: 20, question: "If 'water' is called 'food', 'food' is called 'tree', 'tree' is called 'sky', and 'sky' is called 'wall', on which of the following does a fruit grow?", options: ["food", "tree", "sky", "wall"], correctOption: 2 }
  ],

  // ROUND 4: ADVANCED QUANTITATIVE (10 Questions)
  advanced_quant: [
    { id: 1, question: "In a class of 100 students, 60 passed in Physics, 50 in Chemistry, and 30 in both. How many failed in both?", options: ["10", "20", "30", "40"], correctOption: 1 },
    { id: 2, question: "Find the number of ways to arrange the letters of the word 'SYSTEMS' such that all vowels do not sit together.", options: ["360", "420", "1260", "2100"], correctOption: 1 },
    { id: 3, question: "A bag contains 3 red, 4 blue, and 5 green marbles. If 2 marbles are drawn at random, what is the probability that both are blue?", options: ["1/11", "2/11", "3/11", "4/33"], correctOption: 0 },
    { id: 4, question: "The probability that a contractor will get plumbing contract is 2/3 and the probability that he will get electric contract is 4/9. If the probability of getting at least one contract is 4/5, what is the probability that he will get both?", options: ["14/45", "17/45", "22/45", "None of these"], correctOption: 0 },
    { id: 5, question: "In how many ways can 6 men and 5 women sit around a circular table such that no two women sit together?", options: ["14400", "7200", "86400", "None of these"], correctOption: 0 },
    { id: 6, question: "In a group of 8 people, each shakes hands with everyone else. What is the total number of handshakes?", options: ["28", "32", "56", "64"], correctOption: 0 },
    { id: 7, question: "Find the standard deviation of the numbers: 2, 4, 4, 4, 5, 5, 7, 9.", options: ["2", "2.5", "3", "3.2"], correctOption: 0 },
    { id: 8, question: "A box contains 5 black and 5 white balls. If two balls are drawn one after another without replacement, what is the probability that they are of different colors?", options: ["1/2", "5/9", "4/9", "1/5"], correctOption: 1 },
    { id: 9, question: "What is the remainder when 2^100 is divided by 101?", options: ["1", "2", "100", "None of these"], correctOption: 0 },
    { id: 10, question: "A cylinder and a cone have equal base radii and equal heights. If the volume of the cylinder is 120 cm³, find the volume of the cone.", options: ["30 cm³", "40 cm³", "60 cm³", "90 cm³"], correctOption: 1 }
  ],

  // ROUND 5: ADVANCED REASONING (10 Questions)
  advanced_reasoning: [
    { id: 1, question: "Statements: Most players are engineers. All engineers are smart. Conclusion I: Some smart people are players. Conclusion II: Most engineers are players.", options: ["Only I follows", "Only II follows", "Neither I nor II follows", "Both I and II follow"], correctOption: 3 },
    { id: 2, question: "If A is taller than B, B is shorter than C, C is taller than D, and D is shorter than A, who is definitely the shortest?", options: ["B", "D", "A", "Cannot be determined"], correctOption: 3 },
    { id: 3, question: "A cube is painted red on all sides and cut into 27 small cubes of equal size. How many small cubes have only two sides painted?", options: ["6", "8", "12", "18"], correctOption: 2 },
    { id: 4, question: "Find the missing term: SCD, TEF, UGH, _, WKL", options: ["VIJ", "VJH", "UJI", "IJT"], correctOption: 0 },
    { id: 5, question: "If '+' means '*', '-' means '/', '*' means '+', and '/' means '-', what is the value of 8 + 4 - 2 * 6 / 3?", options: ["12", "15", "19", "21"], correctOption: 2 },
    { id: 6, question: "In a row of 30 girls, when Radha was shifted to her left by 4 places, her number from the left end became 10th. What was the number of her original position from the right end of the row?", options: ["15th", "16th", "17th", "18th"], correctOption: 2 },
    { id: 7, question: "Find the odd one out: 24, 60, 120, 210", options: ["24", "60", "120", "210"], correctOption: 0 },
    { id: 8, question: "If the day before yesterday was Thursday, when will Sunday fall?", options: ["Tomorrow", "Today", "Day after tomorrow", "Yesterday"], correctOption: 0 },
    { id: 9, question: "Pointing to a man, a woman says: 'He is the only son of the only daughter-in-law of my husband's father.' How is the man related to the woman?", options: ["Brother", "Uncle", "Son", "Husband"], correctOption: 2 },
    { id: 10, question: "Statements: No car is a bike. Some bikes are cycle. Conclusion I: No car is a cycle. Conclusion II: Some cycle are not car.", options: ["Only I follows", "Only II follows", "Neither follows", "Both follow"], correctOption: 1 }
  ]
};

export default aptitudeQuestions;
