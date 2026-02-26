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
    const [tagsText, setTagsText] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const allTags = Array.from(new Set(recipes.flatMap(r => r.tags || []))).sort();
    const filteredRecipes = activeTag
        ? recipes.filter(r => r.tags?.includes(activeTag))
        : recipes;

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
        const parsedTags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
        await addRecipe(coupleId, title.trim(), ingredients, steps, user.uid, undefined, undefined, parsedTags);
        setTitle('');
        setIngredients([]);
        setSteps([]);
        setTagsText('');
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
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    // Detail view of a recipe
    if (selectedRecipe) {
        const recipe = recipes.find((r) => r.id === selectedRecipe.id) || selectedRecipe;
        const checkedCount = recipe.ingredients.filter((i) => i.checked).length;

        return (
            <View className="flex-1 bg-gray-50 dark:bg-slate-900">
                <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => setSelectedRecipe(null)} className="mr-3">
                            <Text className="text-2xl dark:text-white">←</Text>
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{recipe.title}</Text>
                            <Text className="text-sm text-gray-400 dark:text-slate-400 mt-1">
                                {recipe.ingredients.length} ingredients · {recipe.steps.length} steps
                            </Text>
                            {recipe.tags && recipe.tags.length > 0 && (
                                <View className="flex-row flex-wrap mt-2">
                                    {recipe.tags.map((tag, i) => (
                                        <View key={i} className="bg-indigo-100 dark:bg-indigo-900 rounded-full px-2 py-1 mr-2 mt-1">
                                            <Text className="text-xs text-indigo-700 dark:text-indigo-300">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
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
                            className="flex-row items-center bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 border border-gray-100 dark:border-slate-700"
                        >
                            <Text className="text-xl mr-3">{ing.checked ? '✅' : '⬜'}</Text>
                            <Text
                                className={`text-base flex-1 ${ing.checked ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-white'
                                    }`}
                            >
                                {ing.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    {recipe.ingredients.length === 0 && (
                        <Text className="text-gray-400 dark:text-slate-500 italic mb-4">No ingredients added</Text>
                    )}

                    {/* Steps */}
                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">
                        👩‍🍳 Steps
                    </Text>
                    {recipe.steps.map((step, i) => (
                        <View key={i} className="flex-row bg-white dark:bg-slate-800 rounded-xl p-4 mb-2 border border-gray-100 dark:border-slate-700">
                            <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-3">
                                <Text className="text-indigo-600 dark:text-indigo-400 font-bold">{step.order}</Text>
                            </View>
                            <Text className="text-base text-gray-800 dark:text-white flex-1">{step.text}</Text>
                        </View>
                    ))}
                    {recipe.steps.length === 0 && (
                        <Text className="text-gray-400 dark:text-slate-500 italic">No steps added</Text>
                    )}

                    <View className="h-20" />
                </ScrollView>
            </View>
        );
    }

    // Recipe list view
    return (
        <View className="flex-1 bg-gray-50 dark:bg-slate-900">
            <View className="bg-white dark:bg-slate-900 pt-14 pb-4 px-6 border-b border-gray-100 dark:border-slate-800">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Text className="text-2xl dark:text-white">←</Text>
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white">🍳 Recipes</Text>
                        <Text className="text-sm text-gray-500 dark:text-slate-400 mt-1">{recipes.length} recipes</Text>
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
                <View className="bg-white dark:bg-slate-800 mx-4 mt-4 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">New Recipe</Text>

                    <TextInput
                        className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-3"
                        placeholder="Recipe name..."
                        placeholderTextColor="#9CA3AF"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-3"
                        placeholder="Tags (comma separated)..."
                        placeholderTextColor="#9CA3AF"
                        value={tagsText}
                        onChangeText={setTagsText}
                    />

                    {/* Ingredients Input */}
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Ingredients</Text>
                    <View className="flex-row mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white mr-2"
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
                        <View key={i} className="flex-row items-center bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2 mb-1">
                            <Text className="flex-1 text-sm text-gray-700 dark:text-slate-200">• {ing.name}</Text>
                            <TouchableOpacity onPress={() => removeIngredient(i)}>
                                <Text className="text-red-400 text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Steps Input */}
                    <Text className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1 mt-3">Steps</Text>
                    <View className="flex-row mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white mr-2"
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
                        <View key={i} className="flex-row items-center bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2 mb-1">
                            <Text className="flex-1 text-sm text-gray-700 dark:text-slate-200">{s.order}. {s.text}</Text>
                            <TouchableOpacity onPress={() => removeStep(i)}>
                                <Text className="text-red-400 text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!title.trim()}
                        className={`rounded-xl py-3 items-center mt-4 ${title.trim() ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'
                            }`}
                    >
                        <Text className="text-white font-bold">Save Recipe</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Tags Filter */}
            {!showForm && allTags.length > 0 && (
                <View className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => setActiveTag(null)}
                            className={`px-4 py-2 rounded-full mr-2 ${!activeTag ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-800'}`}
                        >
                            <Text className={`font-medium ${!activeTag ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {allTags.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-full mr-2 ${activeTag === tag ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-800'}`}
                            >
                                <Text className={`font-medium ${activeTag === tag ? 'text-white' : 'text-gray-600 dark:text-slate-300'}`}>
                                    #{tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Recipe Cards */}
            <FlatList
                data={filteredRecipes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedRecipe(item)}
                        onLongPress={() => handleDelete(item)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-3 border border-gray-100 dark:border-slate-700"
                    >
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</Text>
                        <View className="flex-row mt-2">
                            <Text className="text-sm text-gray-400 dark:text-slate-400 mr-4">
                                🥕 {item.ingredients.length} ingredients
                            </Text>
                            <Text className="text-sm text-gray-400 dark:text-slate-400">
                                👩‍🍳 {item.steps.length} steps
                            </Text>
                        </View>
                        {item.tags && item.tags.length > 0 && (
                            <View className="flex-row flex-wrap mt-2">
                                {item.tags.map((tag, i) => (
                                    <View key={i} className="bg-indigo-100 dark:bg-indigo-900 rounded-full px-2 py-1 mr-2 mt-1">
                                        <Text className="text-xs text-indigo-700 dark:text-indigo-300">#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {item.ingredients.length > 0 && (
                            <View className="flex-row mt-2">
                                <View className="bg-green-50 dark:bg-green-900 rounded-lg px-2 py-1">
                                    <Text className="text-xs text-green-600 dark:text-green-400">
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
                        <Text className="text-gray-400 dark:text-slate-500 text-center">No recipes yet. Add your first one!</Text>
                    </View>
                }
            />
        </View>
    );
}
