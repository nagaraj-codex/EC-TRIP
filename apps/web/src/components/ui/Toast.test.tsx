import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastContainer } from './Toast';

describe('ToastContainer', () => {
  it('renders without crashing', () => {
    const { container } = render(<ToastContainer />);
    expect(container).toBeTruthy();
  });
});
