Pipeable & non pipeable `Monad` instances for redux selectors.

**Example:**

```typescript
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe, flow } from 'fp-ts/function'
import * as S from 'fp-ts-redux-selector/Selector'

const recipeLens = (id: EntityId) => L.lens(...)
const recipeListIdsLens = L.lens(...)

const selectRecipe = (id: EntityId) => S.fromLens(recipeLens)

const selectRecipes = (
  ids: EntityId[]
): S.Selector<EntitiesStateSlice, O.Option<Recipe[]>> =>
  pipe(
    ids,
    A.traverse(S.Applicative)(selectRecipe),
    S.map(A.sequence(O.Applicative))
  )

const selectRecipeListIds = S.fromLens(recipeListIdsLens)

export const selectRecipeList = pipe(
  selectRecipeListIds,
  S.chainW(selectRecipes)
)

```
