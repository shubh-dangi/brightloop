import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Brightloop App Root and Shell', () => {
  it('renders without crashing and displays the Brightloop enterprise platform', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Brightloop/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(brandElements[0]).toBeInTheDocument();
  });
});
