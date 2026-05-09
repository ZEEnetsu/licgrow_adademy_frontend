import { Navigate, Route, Routes } from 'react-router-dom';

import MockTestShell from './MockTestShell.jsx';
import TestListScreen from './TestListScreen.jsx';
import TestDetailScreen from './TestDetailScreen.jsx';
import ExamScreen from './ExamScreen.jsx';
import ResultScreen from './ResultScreen.jsx';

export default function MockTestModule() {
  return (
    <Routes>
      <Route path=":testId/exam" element={<ExamScreen />} />

      <Route element={<MockTestShell />}>
        <Route index element={<TestListScreen />} />
        <Route path=":testId/result" element={<ResultScreen />} />
        <Route path=":testId" element={<TestDetailScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/mock-tests" replace />} />
    </Routes>
  );
}
