// This component can be added to any page to show local environment notes
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Info } from 'lucide-react';

export function DemoInstructions() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Local Environment Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-blue-700 space-y-2">
        <p><strong>HR Login:</strong> Use a registered HR work email and password to access recruiter tools</p>
        <p><strong>Job Board:</strong> Candidates can browse all published roles without signing in</p>
        <p><strong>Application:</strong> Upload a PDF resume to trigger parsing and ATS screening</p>
        <p><strong>Interview:</strong> Shortlisted candidates receive a secure interview link by email</p>
        <p><strong>Proctoring:</strong> Browser and webcam checks run during the live interview session</p>
      </CardContent>
    </Card>);

}
