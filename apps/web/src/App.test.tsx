import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Root and Shell', () => {
  it('renders without crashing and displays the UNKNOWN enterprise workspace', () => {
    render(<App />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});
