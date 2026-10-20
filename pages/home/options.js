export function Options() {
  return `
<section id="options" class="panel">
  <h2>Options</h2>
  <div class="caption-row">
    <article class="caption caption-intro">
      <p class="plan-mark">Starter</p>
      <p><b>First 60-minute session</b></p>
      <ul>
        <li>One-time first session, limited to one per person.</li>
        <li>One purchase per email address.</li>
         <li>Provides time to get a feel for the process.</li>
      </ul>
      <p class="options-price">$85.00</p>
      <form class="plan-buy" data-plan-buy="starter">
        <button class="button" type="submit">Buy</button>
        <p class="plan-status" data-checkout-status role="status" aria-live="polite"></p>
        <div class="plan-hp" aria-hidden="true">
          <label for="starter-hp">Leave blank</label>
          <input id="starter-hp" name="checkout_hp" type="text" tabindex="-1" autocomplete="off">
        </div>
      </form>
    </article>
    <article class="caption">
      <p class="plan-mark">Pay-as-you-go</p>
      <p><b>One 60-minute session as you need it</b></p>
      <ul>
        <li>Buy a 60-minute session whenever you need one.</li>
        <li>Flexibility to schedule sessions as you go.</li>
      </ul>
      <p class="options-price">$125.00</p>
      <form class="plan-buy" data-plan-buy="session">
        <button class="button" type="submit">Buy</button>
        <p class="plan-status" data-checkout-status role="status" aria-live="polite"></p>
        <div class="plan-hp" aria-hidden="true">
          <label for="session-hp">Leave blank</label>
          <input id="session-hp" name="checkout_hp" type="text" tabindex="-1" autocomplete="off">
        </div>
      </form>
    </article>
    <article class="caption">
      <p class="plan-mark">6 Pack</p>
      <p><b>Six 60-minute sessions to go deeper with PRT</b></p>
      <ul>
        <li>Includes six 60-minute sessions.</li>
        <li>Provides time to build and practice the skills and see initial results.</li>
      </ul>
      <p class="options-price">$650.00</p>
      <form class="plan-buy" data-plan-buy="pack-6">
        <button class="button" type="submit">Buy</button>
        <p class="plan-status" data-checkout-status role="status" aria-live="polite"></p>
        <div class="plan-hp" aria-hidden="true">
          <label for="pack-6-hp">Leave blank</label>
          <input id="pack-6-hp" name="checkout_hp" type="text" tabindex="-1" autocomplete="off">
        </div>
      </form>
    </article>
    <article class="caption caption-best">
      <p class="plan-mark">12 Pack</p>
      <p><b>Twelve 60-minute sessions to get the most out of PRT</b></p>
      <ul>
        <li>Includes twelve 60-minute sessions.</li>
        <li>Provides time to build and practice the skills and see sustained results.</li>
      </ul>
      <p class="options-price">$1,200.00</p>
      <form class="plan-buy" data-plan-buy="pack-12">
        <button class="button" type="submit">Buy</button>
        <p class="plan-status" data-checkout-status role="status" aria-live="polite"></p>
        <div class="plan-hp" aria-hidden="true">
          <label for="pack-12-hp">Leave blank</label>
          <input id="pack-12-hp" name="checkout_hp" type="text" tabindex="-1" autocomplete="off">
        </div>
      </form>
      <img class="best-value-badge" src="images/best_value_badge.png" alt="Best value" width="1378" height="1142">
    </article>
  </div>
</section>
`;
}
