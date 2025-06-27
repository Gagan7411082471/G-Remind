import SelectShopScreen from '../screens/SelectShopScreen';
export default SelectShopScreen;
export const options = {
  title: 'Select Store 🛒', // Tab label
  tabBarIcon: ({ color, size }) => (
    <Ionicons name="storefront" size={size} color={color} />
  ),
};