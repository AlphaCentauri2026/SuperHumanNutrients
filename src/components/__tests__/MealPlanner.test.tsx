import { screen, fireEvent, waitFor } from '@testing-library/react';
import { MealPlanner } from '../MealPlanner';
import { renderWithAuth } from '../../__tests__/utils/test-utils';

// Mock the useDatabase hook
jest.mock('../../hooks/useDatabase', () => ({
  useDatabase: () => ({
    getFoodGroups: jest.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('MealPlanner', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' },
      loading: false,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, mealPlan: 'Test meal plan' }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Food Selection Buttons', () => {
    it('adds fruits when Add button is clicked', async () => {
      renderWithAuth();

      // Find the fruits input and add button
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      // Type in the input
      fireEvent.change(fruitInput, { target: { value: 'Apple' } });

      // Click add button
      fireEvent.click(addButton);

      // Check if the fruit was added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });

    it('adds vegetables when Add button is clicked', async () => {
      renderWithAuth();

      // Find the vegetables input and add button
      const vegetableInput = screen.getByPlaceholderText('Add vegetables...');
      const addButton = screen.getAllByRole('button', { name: 'Add' })[1]; // Second Add button

      // Type in the input
      fireEvent.change(vegetableInput, { target: { value: 'Carrot' } });

      // Click add button
      fireEvent.click(addButton);

      // Check if the vegetable was added
      await waitFor(() => {
        expect(screen.getByText('Carrot')).toBeInTheDocument();
      });
    });

    it('adds grains when Add button is clicked', async () => {
      renderWithAuth();

      // Find the grains input and add button
      const grainInput = screen.getByPlaceholderText('Add grains...');
      const addButton = screen.getAllByRole('button', { name: 'Add' })[2]; // Third Add button

      // Type in the input
      fireEvent.change(grainInput, { target: { value: 'Quinoa' } });

      // Click add button
      fireEvent.click(addButton);

      // Check if the grain was added
      await waitFor(() => {
        expect(screen.getByText('Quinoa')).toBeInTheDocument();
      });
    });

    it('removes items when X button is clicked', async () => {
      renderWithAuth();

      // Add a fruit first
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      fireEvent.change(fruitInput, { target: { value: 'Apple' } });
      fireEvent.click(addButton);

      // Wait for the fruit to be added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Find and click the remove button (X)
      const removeButton = screen.getByRole('button', { name: '' }); // X button has no text
      fireEvent.click(removeButton);

      // Check if the fruit was removed
      await waitFor(() => {
        expect(screen.queryByText('Apple')).not.toBeInTheDocument();
      });
    });

    it('clears all items when Clear All button is clicked', async () => {
      renderWithAuth();

      // Add multiple items
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      fireEvent.change(fruitInput, { target: { value: 'Apple' } });
      fireEvent.click(addButton);

      fireEvent.change(fruitInput, { target: { value: 'Banana' } });
      fireEvent.click(addButton);

      // Wait for items to be added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
      });

      // Find and click Clear All button
      const clearAllButton = screen.getByRole('button', { name: 'Clear All' });
      fireEvent.click(clearAllButton);

      // Check if all items were removed
      await waitFor(() => {
        expect(screen.queryByText('Apple')).not.toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
      });
    });
  });

  describe('Suggestion Buttons', () => {
    it('adds suggested fruits when clicked', async () => {
      renderWithAuth();

      // Find and click a suggestion button
      const suggestionButton = screen.getByRole('button', { name: 'Apple' });
      fireEvent.click(suggestionButton);

      // Check if the suggestion was added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });

    it('adds suggested vegetables when clicked', async () => {
      renderWithAuth();

      // Find and click a vegetable suggestion
      const suggestionButton = screen.getByRole('button', { name: 'Spinach' });
      fireEvent.click(suggestionButton);

      // Check if the suggestion was added
      await waitFor(() => {
        expect(screen.getByText('Spinach')).toBeInTheDocument();
      });
    });

    it('adds suggested grains when clicked', async () => {
      renderWithAuth();

      // Find and click a grain suggestion
      const suggestionButton = screen.getByRole('button', { name: 'Quinoa' });
      fireEvent.click(suggestionButton);

      // Check if the suggestion was added
      await waitFor(() => {
        expect(screen.getByText('Quinoa')).toBeInTheDocument();
      });
    });
  });

  describe('Generate Meal Plan Button', () => {
    it('generates meal plan when clicked with valid data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          mealPlan: 'Test meal plan response',
        }),
      });

      renderWithAuth();

      // Add some food items first
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      fireEvent.change(fruitInput, { target: { value: 'Apple' } });
      fireEvent.click(addButton);

      // Wait for the fruit to be added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click generate button
      const generateButton = screen.getByRole('button', {
        name: /generate ai meal plan/i,
      });
      fireEvent.click(generateButton);

      // Check if API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/meal-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fruits: ['Apple'],
            vegetables: [],
            grains: [],
            userPrompt: undefined,
            preferences: undefined,
            dietaryRestrictions: undefined,
          }),
        });
      });
    });

    it('shows error when generate button is clicked without data', async () => {
      renderWithAuth();

      // Try to generate without adding any foods
      const generateButton = screen.getByRole('button', {
        name: /generate ai meal plan/i,
      });
      fireEvent.click(generateButton);

      // Check if error message appears
      await waitFor(() => {
        expect(
          screen.getByText(
            /please either select food items or describe your nutrition goal/i
          )
        ).toBeInTheDocument();
      });
    });

    it('is disabled when no data is provided', () => {
      renderWithAuth();

      const generateButton = screen.getByRole('button', {
        name: /generate ai meal plan/i,
      });
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Reset All Button', () => {
    it('clears all data when clicked', async () => {
      renderWithAuth();

      // Add some data first
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      fireEvent.change(fruitInput, { target: { value: 'Apple' } });
      fireEvent.click(addButton);

      // Add some text to preferences
      const preferencesTextarea = screen.getByPlaceholderText(
        /i prefer quick recipes/i
      );
      fireEvent.change(preferencesTextarea, {
        target: { value: 'Test preferences' },
      });

      // Wait for data to be added
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(preferencesTextarea).toHaveValue('Test preferences');
      });

      // Click Reset All button
      const resetButton = screen.getByRole('button', { name: 'Reset All' });
      fireEvent.click(resetButton);

      // Check if all data was cleared
      await waitFor(() => {
        expect(screen.queryByText('Apple')).not.toBeInTheDocument();
        expect(preferencesTextarea).toHaveValue('');
      });
    });
  });

  describe('Dietary Restrictions', () => {
    it('toggles dietary restrictions when clicked', async () => {
      renderWithAuth();

      // Find and click a dietary restriction button
      const restrictionButton = screen.getByRole('button', {
        name: 'Vegetarian',
      });
      fireEvent.click(restrictionButton);

      // Check if the restriction was selected (should have different styling)
      await waitFor(() => {
        expect(restrictionButton).toHaveClass('bg-blue-500');
      });

      // Click again to deselect
      fireEvent.click(restrictionButton);

      // Check if it was deselected
      await waitFor(() => {
        expect(restrictionButton).not.toHaveClass('bg-blue-500');
      });
    });
  });

  describe('Text Input Functionality', () => {
    it('allows typing in nutrition goal textarea', async () => {
      renderWithAuth();

      const goalTextarea = screen.getByPlaceholderText(
        /i want to build muscle/i
      );
      fireEvent.change(goalTextarea, {
        target: { value: 'I want to lose weight' },
      });

      expect(goalTextarea).toHaveValue('I want to lose weight');
    });

    it('allows typing in preferences textarea', async () => {
      renderWithAuth();

      const preferencesTextarea = screen.getByPlaceholderText(
        /i prefer quick recipes/i
      );
      fireEvent.change(preferencesTextarea, {
        target: { value: 'I love spicy food' },
      });

      expect(preferencesTextarea).toHaveValue('I love spicy food');
    });

    it('allows typing in food input fields', async () => {
      renderWithAuth();

      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      fireEvent.change(fruitInput, { target: { value: 'Mango' } });

      expect(fruitInput).toHaveValue('Mango');
    });
  });

  describe('Authentication State', () => {
    it('shows error when user is not authenticated', async () => {
      renderWithAuth(null); // No user

      // Try to generate meal plan
      const generateButton = screen.getByRole('button', {
        name: /generate ai meal plan/i,
      });
      fireEvent.click(generateButton);

      // Check if authentication error appears
      await waitFor(() => {
        expect(
          screen.getByText(/please sign in to generate meal plans/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state when generating meal plan', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, mealPlan: 'Test' }),
                }),
              100
            )
          )
      );

      renderWithAuth();

      // Add some data
      const fruitInput = screen.getByPlaceholderText('Add fruits...');
      const addButton = screen.getByRole('button', { name: 'Add' });

      fireEvent.change(fruitInput, { target: { value: 'Apple' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Click generate button
      const generateButton = screen.getByRole('button', {
        name: /generate ai meal plan/i,
      });
      fireEvent.click(generateButton);

      // Check if loading state is shown
      await waitFor(() => {
        expect(
          screen.getByText(/generating your meal plan/i)
        ).toBeInTheDocument();
      });
    });
  });
});
