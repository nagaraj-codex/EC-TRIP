import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('renders without crashing', () => {
    const { container } = render(<Select    label="test" options={[]}  />);
    expect(container).toBeTruthy();
  });
});
