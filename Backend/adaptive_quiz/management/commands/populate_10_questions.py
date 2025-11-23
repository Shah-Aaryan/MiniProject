# adaptive_quiz/management/commands/populate_10_questions.py
from django.core.management.base import BaseCommand
from adaptive_quiz.models import QuizCategory, Question, QuestionOption


class Command(BaseCommand):
    help = 'Populate quiz database with exactly 10 questions per category'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating quiz data with 10 questions per category...')

        # Clear existing questions
        Question.objects.all().delete()
        self.stdout.write('Cleared existing questions')

        # Create categories
        categories_data = [
            {
                'name': 'Python Programming',
                'description': 'Test your Python programming skills from basics to advanced',
                'difficulty_level': 3
            },
            {
                'name': 'JavaScript Fundamentals',
                'description': 'Master JavaScript from ES6 to modern frameworks',
                'difficulty_level': 2
            },
            {
                'name': 'Data Structures',
                'description': 'Arrays, linked lists, trees, graphs, and algorithms',
                'difficulty_level': 4
            },
            {
                'name': 'Web Development',
                'description': 'HTML, CSS, responsive design, and modern web technologies',
                'difficulty_level': 2
            }
        ]

        for cat_data in categories_data:
            category, created = QuizCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
            
            # Add exactly 10 questions for each category
            if category.name == 'Python Programming':
                self._create_python_questions(category)
            elif category.name == 'JavaScript Fundamentals':
                self._create_javascript_questions(category)
            elif category.name == 'Data Structures':
                self._create_datastructures_questions(category)
            elif category.name == 'Web Development':
                self._create_webdev_questions(category)

        self.stdout.write(self.style.SUCCESS('Successfully populated quiz data with 10 questions per category!'))

    def _create_python_questions(self, category):
        questions = [
            {
                'question_text': 'What is the output of: print(type([]))?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Python', 'Data Types', 'Built-in Types'],
                'options': [
                    {'text': '<class \'list\'>', 'is_correct': True, 'explanation': 'Lists are denoted by square brackets []'},
                    {'text': '<class \'tuple\'>', 'is_correct': False, 'explanation': 'Tuples use parentheses ()'},
                    {'text': '<class \'dict\'>', 'is_correct': False, 'explanation': 'Dictionaries use curly braces {}'},
                    {'text': '<class \'set\'>', 'is_correct': False, 'explanation': 'Sets also use curly braces but differently'}
                ]
            },
            {
                'question_text': 'Which keyword is used to define a function in Python?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Python', 'Functions', 'Syntax'],
                'options': [
                    {'text': 'def', 'is_correct': True, 'explanation': 'def keyword defines functions in Python'},
                    {'text': 'function', 'is_correct': False, 'explanation': 'This is used in JavaScript, not Python'},
                    {'text': 'fun', 'is_correct': False, 'explanation': 'This is used in Kotlin'},
                    {'text': 'func', 'is_correct': False, 'explanation': 'This is used in Go'}
                ]
            },
            {
                'question_text': 'What is the difference between a shallow copy and a deep copy?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['Python', 'Memory Management', 'Copy'],
                'options': [
                    {'text': 'Shallow copy copies references, deep copy copies objects', 'is_correct': True, 
                     'explanation': 'Shallow copy creates new container but references same objects'},
                    {'text': 'No difference, both are same', 'is_correct': False, 'explanation': 'They are fundamentally different'},
                    {'text': 'Deep copy is faster than shallow copy', 'is_correct': False, 'explanation': 'Deep copy is actually slower'},
                    {'text': 'Shallow copy creates independent objects', 'is_correct': False, 'explanation': 'This describes deep copy'}
                ]
            },
            {
                'question_text': 'What does the "self" keyword represent in Python classes?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['Python', 'OOP', 'Classes'],
                'options': [
                    {'text': 'The instance of the class itself', 'is_correct': True, 'explanation': 'self refers to the current instance'},
                    {'text': 'A static method reference', 'is_correct': False, 'explanation': 'Static methods don\'t use self'},
                    {'text': 'The parent class', 'is_correct': False, 'explanation': 'Parent class is accessed via super()'},
                    {'text': 'A global variable', 'is_correct': False, 'explanation': 'self is instance-specific, not global'}
                ]
            },
            {
                'question_text': 'Which Python module is used for regular expressions?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Python', 'Modules', 'Regex'],
                'options': [
                    {'text': 're', 'is_correct': True, 'explanation': 're module provides regex support'},
                    {'text': 'regex', 'is_correct': False, 'explanation': 'This is a third-party alternative'},
                    {'text': 'pattern', 'is_correct': False, 'explanation': 'No such built-in module'},
                    {'text': 'match', 'is_correct': False, 'explanation': 'match is a method, not a module'}
                ]
            },
            {
                'question_text': 'What is a lambda function in Python?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['Python', 'Functions', 'Lambda'],
                'options': [
                    {'text': 'An anonymous single-expression function', 'is_correct': True, 
                     'explanation': 'Lambda creates unnamed functions with single expression'},
                    {'text': 'A function that runs in parallel', 'is_correct': False, 'explanation': 'Lambda has nothing to do with parallelism'},
                    {'text': 'A recursive function', 'is_correct': False, 'explanation': 'Lambdas can be recursive but that\'s not their definition'},
                    {'text': 'A generator function', 'is_correct': False, 'explanation': 'Generators use yield, not lambda'}
                ]
            },
            {
                'question_text': 'What is the purpose of __init__ method in Python?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['Python', 'OOP', 'Constructor'],
                'options': [
                    {'text': 'Initialize object attributes when instance is created', 'is_correct': True, 
                     'explanation': '__init__ is the constructor method'},
                    {'text': 'Destroy objects when program ends', 'is_correct': False, 'explanation': 'That\'s __del__ method'},
                    {'text': 'Import modules automatically', 'is_correct': False, 'explanation': 'Module import is separate from __init__'},
                    {'text': 'Define static methods', 'is_correct': False, 'explanation': 'Static methods use @staticmethod decorator'}
                ]
            },
            {
                'question_text': 'Which of the following is a mutable data type in Python?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Python', 'Data Types', 'Mutability'],
                'options': [
                    {'text': 'List', 'is_correct': True, 'explanation': 'Lists can be modified after creation'},
                    {'text': 'Tuple', 'is_correct': False, 'explanation': 'Tuples are immutable'},
                    {'text': 'String', 'is_correct': False, 'explanation': 'Strings are immutable'},
                    {'text': 'Frozenset', 'is_correct': False, 'explanation': 'Frozensets are immutable by definition'}
                ]
            },
            {
                'question_text': 'What is the correct way to create a dictionary in Python?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Python', 'Data Structures', 'Dictionary'],
                'options': [
                    {'text': 'my_dict = {"key": "value"}', 'is_correct': True, 'explanation': 'Curly braces with key-value pairs'},
                    {'text': 'my_dict = ["key": "value"]', 'is_correct': False, 'explanation': 'Square brackets define lists'},
                    {'text': 'my_dict = ("key": "value")', 'is_correct': False, 'explanation': 'This is invalid syntax'},
                    {'text': 'my_dict = <"key": "value">', 'is_correct': False, 'explanation': 'Invalid syntax in Python'}
                ]
            },
            {
                'question_text': 'What is the purpose of the "yield" keyword in Python?',
                'difficulty': 'hard',
                'points': 20,
                'time_limit': 60,
                'skill_tags': ['Python', 'Generators', 'Advanced'],
                'options': [
                    {'text': 'Create generator functions that return iterator', 'is_correct': True, 
                     'explanation': 'yield pauses function execution and returns value'},
                    {'text': 'Stop execution and return None', 'is_correct': False, 'explanation': 'That\'s what return does without value'},
                    {'text': 'Raise an exception', 'is_correct': False, 'explanation': 'Use raise keyword for exceptions'},
                    {'text': 'Import modules conditionally', 'is_correct': False, 'explanation': 'yield has nothing to do with imports'}
                ]
            }
        ]
        self._create_questions(category, questions)

    def _create_javascript_questions(self, category):
        questions = [
            {
                'question_text': 'Which of the following is used to declare a variable in JavaScript?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['JavaScript', 'Variables', 'Syntax'],
                'options': [
                    {'text': 'let', 'is_correct': True, 'explanation': 'let declares block-scoped variables'},
                    {'text': 'variable', 'is_correct': False, 'explanation': 'Not a valid keyword'},
                    {'text': 'dim', 'is_correct': False, 'explanation': 'Used in VBA, not JavaScript'},
                    {'text': 'define', 'is_correct': False, 'explanation': 'Not used for variables'}
                ]
            },
            {
                'question_text': 'What does "===" mean in JavaScript?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['JavaScript', 'Operators', 'Comparison'],
                'options': [
                    {'text': 'Strict equality (value and type)', 'is_correct': True, 'explanation': '=== checks both value and type'},
                    {'text': 'Assignment operator', 'is_correct': False, 'explanation': 'Assignment uses single ='},
                    {'text': 'Loose equality', 'is_correct': False, 'explanation': 'Loose equality is =='},
                    {'text': 'Greater than or equal', 'is_correct': False, 'explanation': 'That\'s >= operator'}
                ]
            },
            {
                'question_text': 'What is a closure in JavaScript?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['JavaScript', 'Closures', 'Functions'],
                'options': [
                    {'text': 'Function with access to outer scope variables', 'is_correct': True, 
                     'explanation': 'Closures remember their lexical scope'},
                    {'text': 'A way to close browser tabs', 'is_correct': False, 'explanation': 'Nothing to do with closures'},
                    {'text': 'A loop termination statement', 'is_correct': False, 'explanation': 'Use break for that'},
                    {'text': 'An error handling mechanism', 'is_correct': False, 'explanation': 'That\'s try-catch'}
                ]
            },
            {
                'question_text': 'What is the difference between null and undefined in JavaScript?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['JavaScript', 'Data Types', 'Null'],
                'options': [
                    {'text': 'null is assigned, undefined is uninitialized', 'is_correct': True, 
                     'explanation': 'null is intentional absence, undefined is default'},
                    {'text': 'They are exactly the same', 'is_correct': False, 'explanation': 'They are different types'},
                    {'text': 'undefined is deprecated', 'is_correct': False, 'explanation': 'undefined is still used'},
                    {'text': 'null is a string value', 'is_correct': False, 'explanation': 'null is its own type'}
                ]
            },
            {
                'question_text': 'What is the purpose of the "this" keyword in JavaScript?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['JavaScript', 'Context', 'this'],
                'options': [
                    {'text': 'Refers to the object executing the code', 'is_correct': True, 
                     'explanation': 'this refers to execution context'},
                    {'text': 'Declares a constant', 'is_correct': False, 'explanation': 'Use const for constants'},
                    {'text': 'Imports modules', 'is_correct': False, 'explanation': 'Use import for modules'},
                    {'text': 'Creates private variables', 'is_correct': False, 'explanation': 'Use # prefix for private fields'}
                ]
            },
            {
                'question_text': 'Which method is used to add elements to the end of an array?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['JavaScript', 'Arrays', 'Methods'],
                'options': [
                    {'text': 'push()', 'is_correct': True, 'explanation': 'push() adds to end of array'},
                    {'text': 'pop()', 'is_correct': False, 'explanation': 'pop() removes from end'},
                    {'text': 'shift()', 'is_correct': False, 'explanation': 'shift() removes from beginning'},
                    {'text': 'unshift()', 'is_correct': False, 'explanation': 'unshift() adds to beginning'}
                ]
            },
            {
                'question_text': 'What is the purpose of Promise in JavaScript?',
                'difficulty': 'hard',
                'points': 20,
                'time_limit': 60,
                'skill_tags': ['JavaScript', 'Async', 'Promises'],
                'options': [
                    {'text': 'Handle asynchronous operations', 'is_correct': True, 
                     'explanation': 'Promises represent eventual completion of async operations'},
                    {'text': 'Create loops', 'is_correct': False, 'explanation': 'Use for/while for loops'},
                    {'text': 'Define constants', 'is_correct': False, 'explanation': 'Use const for constants'},
                    {'text': 'Import modules', 'is_correct': False, 'explanation': 'Use import statement'}
                ]
            },
            {
                'question_text': 'What does the spread operator (...) do in JavaScript?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['JavaScript', 'ES6', 'Operators'],
                'options': [
                    {'text': 'Expands iterable into individual elements', 'is_correct': True, 
                     'explanation': 'Spread operator unpacks arrays/objects'},
                    {'text': 'Creates infinite loops', 'is_correct': False, 'explanation': 'Nothing to do with loops'},
                    {'text': 'Concatenates strings', 'is_correct': False, 'explanation': 'Use + for string concatenation'},
                    {'text': 'Divides numbers', 'is_correct': False, 'explanation': 'Use / for division'}
                ]
            },
            {
                'question_text': 'Which keyword is used to create a class in JavaScript?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['JavaScript', 'OOP', 'Classes'],
                'options': [
                    {'text': 'class', 'is_correct': True, 'explanation': 'class keyword defines classes'},
                    {'text': 'function', 'is_correct': False, 'explanation': 'function creates functions, not classes'},
                    {'text': 'object', 'is_correct': False, 'explanation': 'object is not a keyword'},
                    {'text': 'new', 'is_correct': False, 'explanation': 'new instantiates classes'}
                ]
            },
            {
                'question_text': 'What is event bubbling in JavaScript?',
                'difficulty': 'hard',
                'points': 20,
                'time_limit': 60,
                'skill_tags': ['JavaScript', 'DOM', 'Events'],
                'options': [
                    {'text': 'Events propagate from child to parent elements', 'is_correct': True, 
                     'explanation': 'Events bubble up the DOM tree'},
                    {'text': 'Events are cancelled automatically', 'is_correct': False, 'explanation': 'Use preventDefault() to cancel'},
                    {'text': 'Multiple events fire simultaneously', 'is_correct': False, 'explanation': 'That\'s not bubbling'},
                    {'text': 'Events are queued for later', 'is_correct': False, 'explanation': 'That\'s event loop behavior'}
                ]
            }
        ]
        self._create_questions(category, questions)

    def _create_datastructures_questions(self, category):
        questions = [
            {
                'question_text': 'What is the time complexity of accessing an element in an array by index?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Data Structures', 'Arrays', 'Time Complexity'],
                'options': [
                    {'text': 'O(1)', 'is_correct': True, 'explanation': 'Direct access is constant time'},
                    {'text': 'O(n)', 'is_correct': False, 'explanation': 'Linear time is for searching'},
                    {'text': 'O(log n)', 'is_correct': False, 'explanation': 'Logarithmic is for binary search'},
                    {'text': 'O(n²)', 'is_correct': False, 'explanation': 'Quadratic is for nested loops'}
                ]
            },
            {
                'question_text': 'Which data structure uses LIFO (Last In First Out)?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Data Structures', 'Stack', 'LIFO'],
                'options': [
                    {'text': 'Stack', 'is_correct': True, 'explanation': 'Stack follows LIFO principle'},
                    {'text': 'Queue', 'is_correct': False, 'explanation': 'Queue uses FIFO'},
                    {'text': 'Array', 'is_correct': False, 'explanation': 'Arrays have random access'},
                    {'text': 'Tree', 'is_correct': False, 'explanation': 'Trees are hierarchical'}
                ]
            },
            {
                'question_text': 'What is the main advantage of a linked list over an array?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['Data Structures', 'Linked List', 'Arrays'],
                'options': [
                    {'text': 'Dynamic size and efficient insertions/deletions', 'is_correct': True, 
                     'explanation': 'Linked lists grow dynamically and insert/delete in O(1)'},
                    {'text': 'Faster random access', 'is_correct': False, 'explanation': 'Arrays have faster random access'},
                    {'text': 'Less memory usage', 'is_correct': False, 'explanation': 'Linked lists use more memory for pointers'},
                    {'text': 'Better cache performance', 'is_correct': False, 'explanation': 'Arrays have better cache locality'}
                ]
            },
            {
                'question_text': 'In a binary search tree, what is the maximum number of comparisons needed to find an element in a balanced tree with n nodes?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['Data Structures', 'BST', 'Complexity'],
                'options': [
                    {'text': 'O(log n)', 'is_correct': True, 'explanation': 'Balanced BST has logarithmic height'},
                    {'text': 'O(n)', 'is_correct': False, 'explanation': 'That\'s worst case for unbalanced tree'},
                    {'text': 'O(1)', 'is_correct': False, 'explanation': 'Constant time is not possible'},
                    {'text': 'O(n²)', 'is_correct': False, 'explanation': 'Never takes quadratic time'}
                ]
            },
            {
                'question_text': 'Which sorting algorithm has the best average-case time complexity?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['Algorithms', 'Sorting', 'Complexity'],
                'options': [
                    {'text': 'Quick Sort O(n log n)', 'is_correct': True, 'explanation': 'Quick sort averages O(n log n)'},
                    {'text': 'Bubble Sort O(n²)', 'is_correct': False, 'explanation': 'Bubble sort is O(n²)'},
                    {'text': 'Selection Sort O(n²)', 'is_correct': False, 'explanation': 'Selection sort is O(n²)'},
                    {'text': 'Insertion Sort O(n²)', 'is_correct': False, 'explanation': 'Insertion sort is O(n²) average'}
                ]
            },
            {
                'question_text': 'What is a hash table collision?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['Data Structures', 'Hash Table', 'Collision'],
                'options': [
                    {'text': 'When two keys hash to the same index', 'is_correct': True, 
                     'explanation': 'Collision occurs when hash function produces same index'},
                    {'text': 'When hash table is full', 'is_correct': False, 'explanation': 'Full table is different from collision'},
                    {'text': 'When a key is not found', 'is_correct': False, 'explanation': 'That\'s just a miss'},
                    {'text': 'When hash function fails', 'is_correct': False, 'explanation': 'Hash function doesn\'t fail'}
                ]
            },
            {
                'question_text': 'Which graph traversal algorithm uses a queue?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['Graphs', 'BFS', 'Traversal'],
                'options': [
                    {'text': 'BFS (Breadth-First Search)', 'is_correct': True, 'explanation': 'BFS uses queue for level-order traversal'},
                    {'text': 'DFS (Depth-First Search)', 'is_correct': False, 'explanation': 'DFS uses stack'},
                    {'text': 'Dijkstra\'s Algorithm', 'is_correct': False, 'explanation': 'Dijkstra uses priority queue'},
                    {'text': 'Binary Search', 'is_correct': False, 'explanation': 'Binary search doesn\'t use queue'}
                ]
            },
            {
                'question_text': 'What is the space complexity of recursive algorithms typically related to?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['Algorithms', 'Recursion', 'Space Complexity'],
                'options': [
                    {'text': 'The maximum depth of recursion', 'is_correct': True, 
                     'explanation': 'Call stack grows with recursion depth'},
                    {'text': 'The input size', 'is_correct': False, 'explanation': 'Not always proportional to input'},
                    {'text': 'The number of variables', 'is_correct': False, 'explanation': 'Variables are secondary'},
                    {'text': 'Always O(1)', 'is_correct': False, 'explanation': 'Recursion needs stack space'}
                ]
            },
            {
                'question_text': 'Which data structure is most efficient for implementing a priority queue?',
                'difficulty': 'hard',
                'points': 20,
                'time_limit': 50,
                'skill_tags': ['Data Structures', 'Heap', 'Priority Queue'],
                'options': [
                    {'text': 'Binary Heap', 'is_correct': True, 'explanation': 'Binary heap offers O(log n) operations'},
                    {'text': 'Array', 'is_correct': False, 'explanation': 'Array requires O(n) for some operations'},
                    {'text': 'Linked List', 'is_correct': False, 'explanation': 'Linked list is less efficient'},
                    {'text': 'Stack', 'is_correct': False, 'explanation': 'Stack doesn\'t support priority'}
                ]
            },
            {
                'question_text': 'What is the worst-case time complexity of searching in a hash table?',
                'difficulty': 'hard',
                'points': 20,
                'time_limit': 50,
                'skill_tags': ['Data Structures', 'Hash Table', 'Complexity'],
                'options': [
                    {'text': 'O(n)', 'is_correct': True, 'explanation': 'Worst case is when all keys collide'},
                    {'text': 'O(1)', 'is_correct': False, 'explanation': 'O(1) is average case, not worst'},
                    {'text': 'O(log n)', 'is_correct': False, 'explanation': 'Hash tables don\'t use tree structure'},
                    {'text': 'O(n²)', 'is_correct': False, 'explanation': 'Never takes quadratic time'}
                ]
            }
        ]
        self._create_questions(category, questions)

    def _create_webdev_questions(self, category):
        questions = [
            {
                'question_text': 'What does HTML stand for?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['HTML', 'Basics', 'Web'],
                'options': [
                    {'text': 'HyperText Markup Language', 'is_correct': True, 'explanation': 'HTML is the standard markup language'},
                    {'text': 'High Tech Modern Language', 'is_correct': False, 'explanation': 'Incorrect expansion'},
                    {'text': 'Home Tool Markup Language', 'is_correct': False, 'explanation': 'Incorrect expansion'},
                    {'text': 'Hyperlinks and Text Markup Language', 'is_correct': False, 'explanation': 'Incorrect expansion'}
                ]
            },
            {
                'question_text': 'Which CSS property is used to change the text color?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['CSS', 'Styling', 'Properties'],
                'options': [
                    {'text': 'color', 'is_correct': True, 'explanation': 'color property sets text color'},
                    {'text': 'text-color', 'is_correct': False, 'explanation': 'No such property'},
                    {'text': 'font-color', 'is_correct': False, 'explanation': 'No such property'},
                    {'text': 'text-style', 'is_correct': False, 'explanation': 'This doesn\'t set color'}
                ]
            },
            {
                'question_text': 'What is the correct HTML tag for the largest heading?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['HTML', 'Tags', 'Headings'],
                'options': [
                    {'text': '<h1>', 'is_correct': True, 'explanation': 'h1 is the largest heading'},
                    {'text': '<h6>', 'is_correct': False, 'explanation': 'h6 is the smallest heading'},
                    {'text': '<heading>', 'is_correct': False, 'explanation': 'No such tag'},
                    {'text': '<head>', 'is_correct': False, 'explanation': 'head is for metadata'}
                ]
            },
            {
                'question_text': 'Which property is used in CSS for making text bold?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['CSS', 'Font', 'Styling'],
                'options': [
                    {'text': 'font-weight', 'is_correct': True, 'explanation': 'font-weight: bold makes text bold'},
                    {'text': 'font-style', 'is_correct': False, 'explanation': 'font-style is for italic'},
                    {'text': 'text-bold', 'is_correct': False, 'explanation': 'No such property'},
                    {'text': 'bold', 'is_correct': False, 'explanation': 'Not a valid CSS property'}
                ]
            },
            {
                'question_text': 'What does CSS stand for?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['CSS', 'Basics', 'Web'],
                'options': [
                    {'text': 'Cascading Style Sheets', 'is_correct': True, 'explanation': 'CSS adds style to web pages'},
                    {'text': 'Creative Style Sheets', 'is_correct': False, 'explanation': 'Incorrect expansion'},
                    {'text': 'Computer Style Sheets', 'is_correct': False, 'explanation': 'Incorrect expansion'},
                    {'text': 'Colorful Style Sheets', 'is_correct': False, 'explanation': 'Incorrect expansion'}
                ]
            },
            {
                'question_text': 'Which HTML attribute is used to define inline styles?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['HTML', 'CSS', 'Attributes'],
                'options': [
                    {'text': 'style', 'is_correct': True, 'explanation': 'style attribute contains inline CSS'},
                    {'text': 'class', 'is_correct': False, 'explanation': 'class is for external CSS'},
                    {'text': 'styles', 'is_correct': False, 'explanation': 'No such attribute'},
                    {'text': 'css', 'is_correct': False, 'explanation': 'No such attribute'}
                ]
            },
            {
                'question_text': 'What is the purpose of the <div> tag in HTML?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['HTML', 'Layout', 'Tags'],
                'options': [
                    {'text': 'Container for grouping HTML elements', 'is_correct': True, 
                     'explanation': 'div is a generic container element'},
                    {'text': 'Create divisions in text', 'is_correct': False, 'explanation': 'Use <hr> for divisions'},
                    {'text': 'Add dividing lines', 'is_correct': False, 'explanation': 'Use border property'},
                    {'text': 'Divide the page into sections', 'is_correct': False, 'explanation': 'Use <section> semantically'}
                ]
            },
            {
                'question_text': 'Which CSS property is used to change the background color?',
                'difficulty': 'easy',
                'points': 10,
                'time_limit': 30,
                'skill_tags': ['CSS', 'Background', 'Properties'],
                'options': [
                    {'text': 'background-color', 'is_correct': True, 'explanation': 'Sets element background color'},
                    {'text': 'bg-color', 'is_correct': False, 'explanation': 'No such property'},
                    {'text': 'color-background', 'is_correct': False, 'explanation': 'Wrong order'},
                    {'text': 'background', 'is_correct': False, 'explanation': 'background is shorthand for multiple properties'}
                ]
            },
            {
                'question_text': 'What is the box model in CSS?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 45,
                'skill_tags': ['CSS', 'Box Model', 'Layout'],
                'options': [
                    {'text': 'Margin, Border, Padding, Content', 'is_correct': True, 
                     'explanation': 'Box model consists of these 4 layers'},
                    {'text': 'Width and Height only', 'is_correct': False, 'explanation': 'Box model includes more'},
                    {'text': 'Background and Foreground', 'is_correct': False, 'explanation': 'Not part of box model'},
                    {'text': 'Display and Position', 'is_correct': False, 'explanation': 'These are separate properties'}
                ]
            },
            {
                'question_text': 'Which HTML5 tag is used for semantic navigation?',
                'difficulty': 'medium',
                'points': 15,
                'time_limit': 40,
                'skill_tags': ['HTML5', 'Semantic', 'Navigation'],
                'options': [
                    {'text': '<nav>', 'is_correct': True, 'explanation': 'nav tag represents navigation section'},
                    {'text': '<navigation>', 'is_correct': False, 'explanation': 'No such tag'},
                    {'text': '<menu>', 'is_correct': False, 'explanation': 'menu is for context menus'},
                    {'text': '<navbar>', 'is_correct': False, 'explanation': 'No such HTML tag'}
                ]
            }
        ]
        self._create_questions(category, questions)

    def _create_questions(self, category, questions):
        for q_data in questions:
            question, created = Question.objects.get_or_create(
                category=category,
                question_text=q_data['question_text'],
                defaults={
                    'difficulty': q_data['difficulty'],
                    'points': q_data['points'],
                    'time_limit': q_data['time_limit'],
                    'skill_tags': q_data['skill_tags']
                }
            )
            
            if created:
                for i, opt_data in enumerate(q_data['options']):
                    QuestionOption.objects.create(
                        question=question,
                        option_text=opt_data['text'],
                        is_correct=opt_data['is_correct'],
                        explanation=opt_data.get('explanation', ''),
                        order=i
                    )
                self.stdout.write(f'  ✓ Created: {q_data["question_text"][:50]}...')
