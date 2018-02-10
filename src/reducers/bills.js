import Immutable from 'seamless-immutable'
import { createReducer } from 'reduxsauce'
import { Types } from '../actions'

import mockBills from '../mocks/bills'

import { round, calculatePricePerDay } from '../helpers/Prices'
import { getDaysBetweenDates } from '../helpers/Dates'

export const INITIAL_STATE = Immutable({
  newBillPending: false,
  latestBills: [...mockBills]
})

const toggleSegmentPaid = (state, action) => state.merge({
  latestBills: state.latestBills.map(bill => {
    if (bill.id === action.billId) {
      let segmentsCurrentBalance
      let segmentsIsPaid

      const numberOfDays = getDaysBetweenDates(bill.dateFrom, bill.dateTo)
      const pricePerDay = calculatePricePerDay(bill, numberOfDays)

      return bill.merge({
        segments: bill.segments.map(segment => {
          if (segment.flatmateId === action.flatmateId) {

            if (segment.isPaid) {
              segmentsCurrentBalance = bill.segmentsCurrentBalance - (pricePerDay * segment.daysOwed)
            } else {
              segmentsCurrentBalance = bill.segmentsCurrentBalance + (pricePerDay * segment.daysOwed)
            }

            segmentsIsPaid = bill.price === round(segmentsCurrentBalance)

            return segment.merge({ isPaid: !segment.isPaid })
          }
          return segment
        }),
        segmentsCurrentBalance,
        segmentsIsPaid
      })
    }

    return bill
  })
})


const setNewBillPending = (state, action) => state.merge({ newBillEditing: action.payload })

const addBill = (state, action) => state.merge({
  latestBills: [
    ...state.latestBills,
    {
      id: state.latestBills.length + 1,
      name: null,
      flatmateOwner: 0,
      price: 0,
      dateFrom: null,
      dateTo: null,
      datePaid: null,
      archived: false,
      numberOfSplitSegments: 0,
      segmentsIsPaid: false,
      segmentsCurrentBalance: 0,
      segments: [],
      ...action.payload
    }
  ]
})

const deleteBill = (state, action) => state.merge({
  latestBills: state.latestBills.filter(bill => bill.id !== action.billId)
})

const ACTION_HANDLERS = {
  [Types.TOGGLE_SEGMENT_PAID]: toggleSegmentPaid,
  [Types.SET_NEW_BILL_EDITING]: setNewBillPending,
  [Types.ADD_BILL]: addBill,
  [Types.DELETE_BILL]: deleteBill
}

export default createReducer(INITIAL_STATE, ACTION_HANDLERS);
