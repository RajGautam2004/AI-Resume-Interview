import { createBrowserRouter, Navigate } from "react-router";
import { HrLogin } from "./pages/hr/HrLogin";
import { HrRegister } from "./pages/hr/HrRegister";
import { HrDashboard } from "./pages/hr/HrDashboard";
import { HrJobs } from "./pages/hr/HrJobs";
import { HrCandidates } from "./pages/hr/HrCandidates";
import { HrForgotPassword } from "./pages/hr/HrForgotPassword";
import { HrResetPassword } from "./pages/hr/HrResetPassword";
import { JobBoard } from "./pages/public/JobBoard";
import { JobDescription } from "./pages/public/JobDescription";
import { JobApplication } from "./pages/public/JobApplication";
import { InterviewRoom } from "./pages/public/InterviewRoom";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
{
  path: "/",
  element: <Navigate to="/jobs" replace />
},
{
  path: "/jobs",
  element: <JobBoard />
},
{
  path: "/jobs/:jobId",
  element: <JobDescription />
},
{
  path: "/jobs/:jobId/apply",
  element: <JobApplication />
},
{
  path: "/interview/:token",
  element: <InterviewRoom />
},
{
  path: "/hr/login",
  element: <HrLogin />
},
{
  path: "/hr/register",
  element: <HrRegister />
},
{
  path: "/hr/forgot-password",
  element: <HrForgotPassword />
},
{
  path: "/hr/reset-password/:token",
  element: <HrResetPassword />
},
{
  path: "/hr/dashboard",
  element:
  <ProtectedRoute>
        <HrDashboard />
      </ProtectedRoute>

},
{
  path: "/hr/jobs",
  element:
  <ProtectedRoute>
        <HrJobs />
      </ProtectedRoute>

},
{
  path: "/hr/jobs/:jobId/candidates",
  element:
  <ProtectedRoute>
        <HrCandidates />
      </ProtectedRoute>

},
{
  path: "*",
  element:
  <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Page Not Found</h1>
          <p className="mb-4 text-sm text-muted-foreground">The link you opened is missing or no longer available in the hiring workflow.</p>
          <a href="/jobs" className="text-blue-600 hover:underline">
            Go to Open Roles
          </a>
        </div>
      </div>

}]
);
