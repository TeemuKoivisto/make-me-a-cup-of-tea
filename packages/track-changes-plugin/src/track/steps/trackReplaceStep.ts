/*!
 * © 2021 Atypon Systems LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Fragment, Node as PMNode, Schema, Slice } from 'prosemirror-model'
import type { EditorState, Transaction } from 'prosemirror-state'
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform'

import { deleteAndMergeSplitNodes } from './deleteAndMergeSplitNodes'
import { mergeTrackedMarks } from './mergeTrackedMarks'
import { setFragmentAsInserted } from './setFragmentAsInserted'
import { log } from '../../utils/logger'
import { ExposedReplaceStep, ExposedSlice } from '../../types/pm'
import { NewEmptyAttrs } from '../../types/track'
import * as trackUtils from './track-utils'

export function trackReplaceStep(
  step: ReplaceStep,
  oldState: EditorState,
  newTr: Transaction,
  attrs: NewEmptyAttrs
) {
  log.info('###### ReplaceStep ######')
  let selectionPos = 0
  step.getMap().forEach((fromA: number, toA: number, fromB: number, toB: number) => {
    log.info(`changed ranges: ${fromA} ${toA} ${fromB} ${toB}`)
    const { slice } = step as ExposedReplaceStep
    // Invert the transaction step to prevent it from actually deleting or inserting anything
    const newStep = step.invert(oldState.doc)
    const stepResult = newTr.maybeStep(newStep)
    if (stepResult.failed) {
      log.error(`invert ReplaceStep failed: "${stepResult.failed}"`, newStep)
      return
    }
    // First apply the deleted range and update the insert slice to not include content that was deleted,
    // eg partial nodes in an open-ended slice
    const { deleteMap, mergedInsertPos, newSliceContent } = deleteAndMergeSplitNodes(
      fromA,
      toA,
      undefined,
      oldState.doc,
      newTr,
      oldState.schema,
      attrs,
      slice
    )
    log.info('TR: new steps after applying delete', [...newTr.steps])
    const adjustedInsertPos = mergedInsertPos ?? deleteMap.map(toA)
    if (newSliceContent.size > 0) {
      log.info('newSliceContent', newSliceContent)
      // Since deleteAndMergeSplitBlockNodes modified the slice to not to contain any merged nodes,
      // the sides should be equal. TODO can they be other than 0?
      const openStart = slice.openStart !== slice.openEnd ? 0 : slice.openStart
      const openEnd = slice.openStart !== slice.openEnd ? 0 : slice.openEnd
      const insertedSlice = new Slice(
        setFragmentAsInserted(
          newSliceContent,
          trackUtils.createNewInsertAttrs(attrs),
          oldState.schema
        ),
        openStart,
        openEnd
      )
      const newStep = new ReplaceStep(adjustedInsertPos, adjustedInsertPos, insertedSlice)
      const stepResult = newTr.maybeStep(newStep)
      if (stepResult.failed) {
        log.error(`insert ReplaceStep failed: "${stepResult.failed}"`, newStep)
        return
      }
      log.info('new steps after applying insert', [...newTr.steps])
      mergeTrackedMarks(adjustedInsertPos, newTr.doc, newTr, oldState.schema)
      mergeTrackedMarks(adjustedInsertPos + insertedSlice.size, newTr.doc, newTr, oldState.schema)
      selectionPos = adjustedInsertPos + insertedSlice.size
    } else {
      // Incase only deletion was applied, check whether tracked marks around deleted content can be merged
      mergeTrackedMarks(adjustedInsertPos, newTr.doc, newTr, oldState.schema)
      selectionPos = fromA
    }
  })
  return selectionPos
}
