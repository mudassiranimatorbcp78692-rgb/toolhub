import { useState } from "react";
import { ToolWrapper } from "@/components/tool-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: number;
  name: string;
  grade: string;
  credits: string;
}

const gradePoints: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0,
};

export default function GpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", grade: "A", credits: "3" },
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const { toast } = useToast();

  const addCourse = () => {
    setCourses([...courses, {
      id: Date.now(),
      name: "",
      grade: "A",
      credits: "3",
    }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setCourses(courses.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const calculateGpa = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      const credits = parseFloat(course.credits);
      if (!credits || credits <= 0) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid credits for all courses.",
          variant: "destructive",
        });
        return;
      }

      const points = gradePoints[course.grade] || 0;
      totalPoints += points * credits;
      totalCredits += credits;
    }

    if (totalCredits === 0) {
      toast({
        title: "No Credits",
        description: "Please add courses with credits.",
        variant: "destructive",
      });
      return;
    }

    const calculatedGpa = totalPoints / totalCredits;
    setGpa(calculatedGpa);

    toast({
      title: "GPA Calculated!",
      description: `Your GPA is ${calculatedGpa.toFixed(2)}.`,
    });
  };

  return (
    <ToolWrapper
      toolName="GPA Calculator"
      toolDescription="Calculate your Grade Point Average"
      category="calculators"
      howToUse={[
        "Add your courses using the 'Add Course' button",
        "Enter course name, select grade, and enter credits",
        "Click 'Calculate GPA' to get your result",
        "Add or remove courses as needed",
      ]}
      relatedTools={[
        { name: "Percentage Calculator", path: "/tool/percentage-calculator" },
        { name: "Loan Calculator", path: "/tool/loan-calculator" },
        { name: "Zakat Calculator", path: "/tool/zakat-calculator" },
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={course.id} className="grid grid-cols-12 gap-3 items-end" data-testid={`course-${index}`}>
              <div className="col-span-12 sm:col-span-5">
                <Label htmlFor={`name-${course.id}`}>Course Name</Label>
                <Input
                  id={`name-${course.id}`}
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  placeholder="e.g., Mathematics"
                  data-testid={`input-name-${index}`}
                />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <Label htmlFor={`grade-${course.id}`}>Grade</Label>
                <Select value={course.grade} onValueChange={(v) => updateCourse(course.id, 'grade', v)}>
                  <SelectTrigger id={`grade-${course.id}`} data-testid={`select-grade-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradePoints).map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Label htmlFor={`credits-${course.id}`}>Credits</Label>
                <Input
                  id={`credits-${course.id}`}
                  type="number"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                  placeholder="3"
                  data-testid={`input-credits-${index}`}
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeCourse(course.id)}
                  disabled={courses.length === 1}
                  data-testid={`button-remove-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addCourse}
          className="w-full"
          data-testid="button-add-course"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>

        <Button
          onClick={calculateGpa}
          className="w-full"
          size="lg"
          data-testid="button-calculate"
        >
          Calculate GPA
        </Button>

        {gpa !== null && (
          <div className="p-6 border rounded-lg bg-primary/5 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your GPA</p>
            <p className="text-4xl font-bold text-primary" data-testid="text-gpa">{gpa.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {courses.length} course{courses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
