import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Header';

import { MemoryRouter } from 'react-router-dom';

describe('Header', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
