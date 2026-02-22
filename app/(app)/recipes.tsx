import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
    addRecipe,
    deleteRecipe,
    Ingredient,
    Recipe,
    RecipeStep,
    subscribeToRecipes,
    toggleIngredient,
} from '../../src/services/recipeService';
import { confirmAction } from '../../src/utils/confirm';

export default function RecipeScreen() {
    const router = useRouter();
    const { user, coupleId } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    // Add recipe form
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [ingredientText, setIngredientText] = useState('');
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [stepText, setStepText] = useState('');
    const [steps, setSteps] = useState<RecipeStep[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        if (!coupleId) return;
        const unsub = subscribeToRecipes(coupleId, (data) => {
            setRecipes(data);
            setLoading(false);
        });
        return unsub;
    }, [coupleId]);

    const addIngredient = () => {
        if (!ingredientText.trim()) return;
        setIngredients([...ingredients, { name: ingredientText.trim(), checked: false }]);
        setIngredientText('');
    };

    const removeIngredient = (idx: number) => {
        setIngredients(ingredients.filter((_, i) => i !== idx));
    };

    const addStep = () => {
        if (!stepText.trim()) return;
        setSteps([...steps, { order: steps.length + 1, text: stepText.trim() }]);
        setStepText('');
    };

    const removeStep = (idx: number) => {
        const updated = steps.filter((_, i) => i !== idx);
        setSteps(updated.map((s, i) => ({ ...s, order: i + 1 })));
    };

    const handleSave = async () => {
        if (!title.trim() || !coupleId || !user) return;
        await addRecipe(coupleId, title.trim(), ingredients, steps, user.uid);
        setTitle('');
        setIngredients([]);
        setSteps([]);
        setShowForm(false);
    };

    const handleDelete = (recipe: Recipe) => {
        confirmAction('Delete Recipe', `Delete "${recipe.title}"?`, () => {
            deleteRecipe(coupleId!, recipe.id);
            if (selectedRecipe?.id === recipe.id) setSelectedRecipe(null);
        });
    };

    const handleToggleIngredient = (recipe: Recipe, idx: number) => {
        if (!coupleId) return;
        toggleIngredient(coupleId, recipe.id, recipe.ingredients, idx);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    // Detail view of a recipe
    if (selectedRecipe) {
        const recipe = recipes.find((r) => r.id === selectedRecipe.id) || selectedRecipe;
        const checkedCount = recipe.ingredients.filter((i) => i.checked).length;

        return (
            <View className="flex-1 bg-gray-50">
                <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => setSelectedRecipe(null)} className="mr-3">
                            <Text className="text-2xl">←</Text>
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900">{recipe.title}</Text>
                            <Text className="text-sm text-gray-400 mt-1">
                                {recipe.ingredients.length} ingredients · {recipe.steps.length} steps
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(recipe)}>
                            <Text className="text-red-400 text-lg">🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView className="flex-1 p-6">
                    {/* Ingredients */}
                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                        🥕 Ingredients ({checkedCount}/{recipe.ingredients.length})
                    </Text>
                    {recipe.ingredients.map((ing, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleToggleIngredient(recipe, i)}
                            className="flex-row items-center bg-white rounded-xl p-4 mb-2 border border-gray-100"
                        >
                            <Text className="text-xl mr-3">{ing.checked ? '✅' : '⬜'}</Text>
                            <Text
                                className={`text-base flex-1 ${ing.checked ? 'line-through text-gray-400' : 'text-gray-800'
                                    }`}
                            >
                                {ing.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {recipe.ingredients.length === 0 && (
                        <Text className="text-gray-400 italic mb-4">No ingredients added</Text>
                    )}

                    {/* Steps */}
                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                        👩‍🍳 Steps
                    </Text>
                    {recipe.steps.map((step, i) => (
                        <View key={i} className="flex-row bg-white rounded-xl p-4 mb-2 border border-gray-100">
                            <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                                <Text className="text-indigo-600 font-bold">{step.order}</Text>
                            </View>
                            <Text className="text-base text-gray-800 flex-1">{step.text}</Text>
                        </View>
                    ))}
                    {recipe.steps.length === 0 && (
                        <Text className="text-gray-400 italic">No steps added</Text>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </View>
        );
    }

    // Recipe list view
    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)')} className="mr-3">
                        <Text className="text-2xl">←</Text>
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900">🍳 Recipes</Text>
                        <Text className="text-sm text-gray-500 mt-1">{recipes.length} recipes</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowForm(!showForm)}
                        className="bg-indigo-600 rounded-xl px-3 py-2"
                    >
                        <Text className="text-white font-semibold">{showForm ? '✕' : '+ Add'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Add Recipe Form */}
            {showForm && (
                <View className="bg-white mx-4 mt-4 rounded-2xl p-5 border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 mb-3">New Recipe</Text>

                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base mb-3"
                        placeholder="Recipe name..."
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* Ingredients Input */}
                    <Text className="text-sm font-medium text-gray-500 mb-1">Ingredients</Text>
                    <View className="flex-row mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm mr-2"
                            placeholder="Add ingredient..."
                            placeholderTextColor="#9CA3AF"
                            value={ingredientText}
                            onChangeText={setIngredientText}
                            onSubmitEditing={addIngredient}
                        />
                        <TouchableOpacity onPress={addIngredient} className="bg-green-500 rounded-xl px-3 justify-center">
                            <Text className="text-white font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                    {ingredients.map((ing, i) => (
                        <View key={i} className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mb-1">
                            <Text className="flex-1 text-sm text-gray-700">• {ing.name}</Text>
                            <TouchableOpacity onPress={() => removeIngredient(i)}>
                                <Text className="text-red-400 text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Steps Input */}
                    <Text className="text-sm font-medium text-gray-500 mb-1 mt-3">Steps</Text>
                    <View className="flex-row mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm mr-2"
                            placeholder="Add step..."
                            placeholderTextColor="#9CA3AF"
                            value={stepText}
                            onChangeText={setStepText}
                            onSubmitEditing={addStep}
                        />
                        <TouchableOpacity onPress={addStep} className="bg-blue-500 rounded-xl px-3 justify-center">
                            <Text className="text-white font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                    {steps.map((s, i) => (
                        <View key={i} className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mb-1">
                            <Text className="flex-1 text-sm text-gray-700">{s.order}. {s.text}</Text>
                            <TouchableOpacity onPress={() => removeStep(i)}>
                                <Text className="text-red-400 text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!title.trim()}
                        className={`rounded-xl py-3 items-center mt-4 ${title.trim() ? 'bg-indigo-600' : 'bg-gray-200'
                            }`}
                    >
                        <Text className="text-white font-bold">Save Recipe</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Recipe Cards */}
            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedRecipe(item)}
                        onLongPress={() => handleDelete(item)}
                        className="bg-white rounded-2xl p-5 mb-3 border border-gray-100"
                    >
                        <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
                        <View className="flex-row mt-2">
                            <Text className="text-sm text-gray-400 mr-4">
                                🥕 {item.ingredients.length} ingredients
                            </Text>
                            <Text className="text-sm text-gray-400">
                                👩‍🍳 {item.steps.length} steps
                            </Text>
                        </View>
                        {item.ingredients.length > 0 && (
                            <View className="flex-row mt-2">
                                <View className="bg-green-50 rounded-lg px-2 py-1">
                                    <Text className="text-xs text-green-600">
                                        {item.ingredients.filter((i) => i.checked).length}/{item.ingredients.length} checked
                                    </Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Text className="text-5xl mb-4">🍳</Text>
                        <Text className="text-gray-400 text-center">No recipes yet. Add your first one!</Text>
                    </View>
                }
            />
        </View>
    );
}
