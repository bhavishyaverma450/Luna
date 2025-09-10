import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductState { value: string }
const initialState: ProductState = { value: '' };

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<string>) => { state.value = action.payload; },
    clearProduct: (state) => { state.value = ''; }
  }
});

export const { setProduct, clearProduct } = productSlice.actions;
export default productSlice.reducer;
