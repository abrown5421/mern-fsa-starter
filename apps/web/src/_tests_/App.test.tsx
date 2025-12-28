import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders App text', () => {
  render(<App />);
  expect(screen.getByText(/App/i)).toBeInTheDocument();
});
