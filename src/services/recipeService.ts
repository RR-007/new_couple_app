import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// --- Types ---

export interface Ingredient {
    name: string;
    checked: boolean;
}

export interface RecipeStep {
    order: number;
    text: string;
}

export interface Recipe {
    id: string;
    title: string;
    ingredients: Ingredient[];
    steps: RecipeStep[];
    photo?: string;
    sourceItemId?: string;
    tags?: string[];
    createdBy: string;
    createdAt: any;
}

// --- CRUD ---

const recipesRef = (coupleId: string) =>
    collection(db, 'couples', coupleId, 'recipes');

export const addRecipe = async (
    coupleId: string,
    title: string,
    ingredients: Ingredient[],
    steps: RecipeStep[],
    createdBy: string,
    photo?: string,
    sourceItemId?: string,
    tags: string[] = []
) => {
    return addDoc(recipesRef(coupleId), {
        title,
        ingredients,
        steps,
        photo: photo || null,
        sourceItemId: sourceItemId || null,
        tags,
        createdBy,
        createdAt: serverTimestamp(),
    });
};

export const updateRecipe = async (
    coupleId: string,
    recipeId: string,
    updates: Partial<Omit<Recipe, 'id'>>
) => {
    const ref = doc(db, 'couples', coupleId, 'recipes', recipeId);
    await updateDoc(ref, updates);
};

export const toggleIngredient = async (
    coupleId: string,
    recipeId: string,
    ingredients: Ingredient[],
    index: number
) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    await updateRecipe(coupleId, recipeId, { ingredients: updated });
};

export const deleteRecipe = async (coupleId: string, recipeId: string) => {
    const ref = doc(db, 'couples', coupleId, 'recipes', recipeId);
    await deleteDoc(ref);
};

// --- Real-time Subscription ---

export const subscribeToRecipes = (
    coupleId: string,
    callback: (recipes: Recipe[]) => void
) => {
    const q = query(recipesRef(coupleId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
        const recipes = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as Recipe[];
        callback(recipes);
    });
};
