import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BookDetailPage } from './pages/BookDetailPage';
import { TrainingPage } from './pages/TrainingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import PurchaseSuccessPage from './pages/PurchaseSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/books/:bookId/train" element={<TrainingPage />} />
          <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
