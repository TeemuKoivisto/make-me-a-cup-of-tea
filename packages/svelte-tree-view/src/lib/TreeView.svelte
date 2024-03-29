<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import { get } from 'svelte/store'

  import { recomputeTree } from './tree-utils'
  import { createPropsStore, createRootElementStore, createTreeStore } from './stores'

  import TreeViewNode from './TreeViewNode.svelte'

  import type { Stores } from './stores'
  import type {
    TreeNode,
    TreeViewProps,
    Base16Theme,
    ValueComponent,
    TreeRecursionOpts,
  } from './types'

  export let data: unknown,
    theme: Base16Theme | undefined = undefined,
    showLogButton = false,
    showCopyButton = false,
    valueComponent: ValueComponent | undefined = undefined,
    recursionOpts: TreeRecursionOpts | undefined = {},
    valueFormatter: ((val: any, n: TreeNode) => string | undefined) | undefined = undefined

  let rootElement: HTMLElement | null = null
  const defaultRecursionOpts: TreeRecursionOpts = {
    maxDepth: 16,
    omitKeys: [],
    stopCircularRecursion: false,
    shouldExpandNode: () => false,
  }
  let props: Omit<TreeViewProps, 'data'> = {
    showLogButton,
    showCopyButton,
    valueComponent,
    recursionOpts: {
      ...defaultRecursionOpts,
      ...recursionOpts,
    },
    valueFormatter,
  }
  $: rootNode = treeStore.tree
  $: {
    // To keep things less messy all props are joined to one object _except_ the recursionOpts
    // which is picked from the old props. This is to allow checking between the old and new recursionOpts
    // in the recomputeTree.
    props = {
      showLogButton,
      showCopyButton,
      valueComponent,
      valueFormatter,
      recursionOpts: props.recursionOpts,
    }
  }
  $: {
    // Combine the defaultProps with the possible new recursion opts
    const newRecursionOpts = {
      ...defaultRecursionOpts,
      ...recursionOpts,
    }
    // Compare the old shouldExpandNode option with the possible new shouldExpandNode
    // to know whether to whole tree should be recomputed.
    const recomputeExpandNode =
      props?.recursionOpts?.shouldExpandNode !== newRecursionOpts.shouldExpandNode
    const oldTreeMap = get(treeStore.treeMap)
    const { treeMap, tree, iteratedValues } = recomputeTree(
      data,
      oldTreeMap,
      newRecursionOpts,
      recomputeExpandNode
    )
    treeStore.init(tree, treeMap, iteratedValues)
    props.recursionOpts = newRecursionOpts
    propsStore.setProps(props)
  }
  $: {
    if (theme && rootElement) {
      let key: keyof typeof theme
      for (key in theme) {
        // This ridiculous thing is for TypeScript type inference. Yey..?
        const value = theme[key]
        if (rootElement && key.includes('base') && value) {
          rootElement.style.setProperty(`--tree-view-${key}`, value)
        }
      }
    }
  }

  const propsStore = createPropsStore(props)
  const rootElementStore = createRootElementStore()
  const treeStore = createTreeStore(propsStore)
  setContext<Stores>('svelte-tree-view', {
    propsStore,
    rootElementStore,
    treeStore,
  })

  onMount(() => {
    rootElementStore.set(rootElement)
  })
</script>

<ul class={`${$$props.class || ''} svelte-tree-view`} bind:this={rootElement}>
  {#each $rootNode.children as child}
    <TreeViewNode id={child.id} />
  {/each}
</ul>

<style>
  * {
    box-sizing: border-box;
  }
  .svelte-tree-view {
    --tree-view-font-family: 'Helvetica Neue', 'Calibri Light', Roboto, sans-serif;
    --tree-view-font-size: 13px;
    --tree-view-left-indent: 0.875em;
    --tree-view-line-height: 1.1;
    --tree-view-key-margin-right: 0.5em;
  }
  ul {
    background: var(--tree-view-base00);
    font-family: var(--tree-view-font-family);
    font-size: var(--tree-view-font-size);
    height: max-content;
    list-style: none;
    margin: 0;
    padding: 0;
    width: max-content;
  }
</style>
