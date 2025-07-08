import { Ionicons } from '@expo/vector-icons';
import SavedItemsScreen from '../../screens/SavedItemsScreen';

export default SavedItemsScreen;

// 👇 This sets tab label and icon
export const options = {
  title: 'Saved Items',
  tabBarIcon: ({ color, size }) => (
    <Ionicons name="list" size={size} color={color} />
  ),
};

