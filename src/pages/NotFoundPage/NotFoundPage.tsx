import { useNavigate } from 'react-router-dom';
import { Header, Container } from '@components/layout';
import { Button } from '@components/ui';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Container className="py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <span className="text-6xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </Container>
    </>
  );
}

export default NotFoundPage;
