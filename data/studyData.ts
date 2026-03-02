
import { StudyCard, Language } from '../types';

export const languageStudyData: Record<Language, StudyCard[]> = {
  'C#': [
    {
      id: 'cs-1',
      term: 'Interface',
      definition: 'A contract that defines a set of methods, properties, events, or indexers. Classes or structs that implement the interface must provide the implementation for the members.',
      example: 'public interface IAnimal { void MakeSound(); }'
    },
    {
      id: 'cs-2',
      term: 'Encapsulation',
      definition: 'The process of bundling data and methods that operate on that data within a single unit (class) and restricting access using modifiers like private, protected, and public.',
      example: 'private int _balance; public int Balance { get => _balance; }'
    },
    {
      id: 'cs-3',
      term: 'Virtual Method',
      definition: 'A method that can be redefined in derived classes. The base class provides a default implementation, but the derived class can "override" it.',
      example: 'public virtual void Speak() { Console.WriteLine("..."); }'
    },
    {
      id: 'cs-4',
      term: 'Sealed Class',
      definition: 'A class that cannot be inherited by other classes. It prevents further specialization of the class.',
      example: 'public sealed class finalClass { }'
    },
    {
      id: 'cs-5',
      term: 'Abstract Class',
      definition: 'A class that cannot be instantiated and is intended to be a base class. It can contain abstract methods that must be implemented by derived classes.',
      example: 'public abstract class Shape { public abstract void Draw(); }'
    }
  ],
  'Java': [
    {
      id: 'jv-1',
      term: 'Interface',
      definition: 'Similar to C#, but can also contain default methods and static methods since Java 8.',
      example: 'public interface Drawable { void draw(); default void msg(){System.out.println("default method");} }'
    },
    {
      id: 'jv-2',
      term: 'Polymorphism',
      definition: 'The ability of an object to take on many forms. Most commonly used when a parent class reference is used to refer to a child class object.',
      example: 'Animal myDog = new Dog(); myDog.makeSound();'
    },
    {
      id: 'jv-3',
      term: 'Final Keyword',
      definition: 'Used to restrict the user. Applied to variables (constant), methods (prevent overriding), or classes (prevent inheritance).',
      example: 'final class Bike { }'
    },
    {
      id: 'jv-4',
      term: 'Static Block',
      definition: 'Used for static initialization of a class. This code inside static block is executed only once when the class is loaded into memory.',
      example: 'static { System.out.println("Static block initialized"); }'
    }
  ],
  'Python': [
    {
      id: 'py-1',
      term: 'Self',
      definition: 'Represents the instance of the class. By using the "self" keyword, we can access the attributes and methods of the class in Python.',
      example: 'def __init__(self, name): self.name = name'
    },
    {
      id: 'py-2',
      term: 'Dunder Methods',
      definition: 'Methods with double underscores (e.g., __init__, __str__). They allow you to define behavior for built-in operations.',
      example: 'def __str__(self): return f"Person {self.name}"'
    },
    {
      id: 'py-3',
      term: 'Multiple Inheritance',
      definition: 'Python supports inheriting from multiple parent classes directly.',
      example: 'class Child(Parent1, Parent2): pass'
    },
    {
      id: 'py-4',
      term: 'ABC (Abstract Base Class)',
      definition: 'Python uses the abc module to define abstract base classes and methods.',
      example: 'from abc import ABC, abstractmethod\nclass Shape(ABC): @abstractmethod\n    def area(self): pass'
    }
  ],
  'C++': [
    {
      id: 'cpp-1',
      term: 'Pure Virtual Function',
      definition: 'A virtual function for which we can have implementation, but we must override that function in the derived class, otherwise the derived class will also become abstract.',
      example: 'virtual void draw() = 0;'
    },
    {
      id: 'cpp-2',
      term: 'Destructor',
      definition: 'A special member function that is executed automatically when an object is destroyed. Essential for manual memory management.',
      example: '~MyClass() { delete[] buffer; }'
    },
    {
      id: 'cpp-3',
      term: 'Friend Class',
      definition: 'A class that can access private and protected members of other class in which it is declared as a friend.',
      example: 'friend class B;'
    },
    {
      id: 'cpp-4',
      term: 'Multiple Inheritance',
      definition: 'C++ allows a class to inherit from more than one class. Can lead to the "Diamond Problem".',
      example: 'class C : public A, public B { };'
    }
  ]
};
